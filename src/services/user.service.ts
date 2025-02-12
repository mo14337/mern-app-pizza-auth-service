import createHttpError from 'http-errors';
import { User } from '../entity/User';
import { LimitedUserData, PaginationParams, UserData } from '../types';
import bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';

export class UserService {
    constructor(private readonly userRepository: Repository<User>) {}

    async create({
        firstName,
        lastName,
        email,
        password,
        role,
        tenantId,
    }: UserData) {
        const user = await this.userRepository.findOne({
            where: { email: email },
        });
        if (user) {
            const err = createHttpError(400, 'Email is already exists!');
            throw err;
        }
        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        try {
            return await this.userRepository.save({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                role,
                tenant: tenantId ? { id: tenantId } : undefined,
            });
        } catch (err) {
            console.log(err);
            const error = createHttpError(
                500,
                'Failed to store the data in the database',
            );
            throw error;
        }
    }

    async findByEmailWithPassword(email: string) {
        return await this.userRepository.findOne({
            where: {
                email,
            },
            select: [
                'id',
                'firstName',
                'lastName',
                'email',
                'role',
                'password',
            ],
        });
    }

    async findById(id: number) {
        return await this.userRepository.findOne({
            where: {
                id,
            },
            relations: {
                tenant: true,
            },
        });
    }

    async update(
        userId: number,
        { firstName, lastName, role }: LimitedUserData,
    ) {
        try {
            return await this.userRepository.update(userId, {
                firstName,
                lastName,
                role,
            });
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            const error = createHttpError(
                500,
                'Failed to update the user in the database',
            );
            throw error;
        }
    }

    async getAll(validatedQuery: PaginationParams) {
        const queryBuilder = this.userRepository.createQueryBuilder();
        const result = queryBuilder
            .skip((validatedQuery.currentPage - 1) * validatedQuery.perPage)
            .take(validatedQuery.perPage)
            .getManyAndCount();
        // return await this.userRepository.find();
        return result;
    }

    async deleteById(userId: number) {
        return await this.userRepository.delete(userId);
    }
}
