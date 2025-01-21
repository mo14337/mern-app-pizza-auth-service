import createHttpError from 'http-errors';
import { User } from '../entity/User';
import { UserData } from '../types';
import { Roles } from '../constants';
import bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

export class UserService {
    constructor(private userRespository: Repository<User>) {}
    async create({ firstName, lastName, email, password }: UserData) {
        const user = await this.userRespository.findOne({
            where: { email: email },
        });
        if (user) {
            const error = createHttpError(400, 'Email is already exists.');
            throw error;
        }
        // hashed password
        const saltRound = 10;
        const hashedPassword = await bcrypt.hash(password, saltRound);
        try {
            const user = await this.userRespository.save({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                role: Roles.CUSTOMER,
            });
            return user;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            const error = createHttpError(
                500,
                'Failed to store data in database.',
            );
            throw error;
        }
    }

    async findByEmail(email: string) {
        return await this.userRespository.findOne({
            where: { email: email },
        });
    }
}
