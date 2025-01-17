import createHttpError from 'http-errors';
import { AppDataSource } from '../config/data-source';
import { User } from '../entity/User';
import { UserData } from '../types';
import { Roles } from '../constants';

export class UserService {
    async create({ firstName, lastName, email, password }: UserData) {
        try {
            const userRespository = AppDataSource.getRepository(User);
            const user = await userRespository.save({
                firstName,
                lastName,
                email,
                password,
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
