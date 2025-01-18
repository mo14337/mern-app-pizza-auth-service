import { NextFunction, Response } from 'express';
import { ResgisterUserRequest } from '../types';
import { UserService } from '../services/user.service';
import { Logger } from 'winston';
import createHttpError from 'http-errors';

export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
    ) {}
    async register(
        req: ResgisterUserRequest,
        res: Response,
        next: NextFunction,
    ) {
        const { firstName, lastName, email, password } = req.body;

        if (!email) {
            const error = createHttpError(400, 'Email is missing.');
            next(error);
            return;
        }
        this.logger.debug('new request to register a user', {
            firstName,
            lastName,
            email,
            password: '*******',
        });
        try {
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
            });
            this.logger.info('user has been registred', { id: user.id });
            res.status(201).json({ user });
        } catch (error) {
            next(error);
            return;
        }
    }
}
