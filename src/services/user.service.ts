import { AppDataSource } from '../config/data-source';
import { User } from '../entity/User';
import { UserData } from '../types';

export class UserService {
    async create({ firstName, lastName, email, password }: UserData) {
        const userRespository = AppDataSource.getRepository(User);
        await userRespository.save({
            firstName,
            lastName,
            email,
            password,
        });
    }
}
