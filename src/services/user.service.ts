import createHttpError from 'http-errors';
import { AppDataSource } from '../config/data-source';
import { User } from '../entity/User';
import { UserData } from '../types';
import { Roles } from '../constants';
import bcrypt from 'bcrypt';

export class UserService {
    async create({ firstName, lastName, email, password }: UserData) {
        const userRespository = AppDataSource.getRepository(User);
        const user = await userRespository.findOne({ where: { email: email } });
        if (user) {
            const error = createHttpError(400, 'Email is already exists.');
            throw error;
        }
        // hashed password
        const saltRound = 10;
        const hashedPassword = await bcrypt.hash(password, saltRound);
        try {
            const user = await userRespository.save({
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
}
