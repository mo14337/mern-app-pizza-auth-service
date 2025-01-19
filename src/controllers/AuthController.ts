import { NextFunction, Response } from 'express';
import { ResgisterUserRequest } from '../types';
import { UserService } from '../services/user.service';
import { Logger } from 'winston';
import { validationResult } from 'express-validator';
import { JwtPayload, sign } from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import createHttpError from 'http-errors';
import { Config } from '../config';

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
        //validation
        const result = validationResult(req);
        const { REFRESH_TOKEN_SECRET } = Config;
        if (!result.isEmpty()) {
            res.status(400).json({ errors: result.array() });
            return;
        }
        const { firstName, lastName, email, password } = req.body;

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
            let privateKey;
            try {
                privateKey = fs.readFileSync(
                    path.join(__dirname, '../../certs/private.pem'),
                );

                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (err) {
                const error = createHttpError(
                    500,
                    'Error while reading private key',
                );
                next(error);
                return;
            }
            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            const accessToken = sign(payload, privateKey, {
                algorithm: 'RS256',
                expiresIn: '1h',
                issuer: 'auth-service',
            });

            const refreshToken = sign(payload, REFRESH_TOKEN_SECRET!, {
                algorithm: 'HS256',
                expiresIn: '1y',
                issuer: 'auth-service',
            });

            res.cookie('accessToken', accessToken, {
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60, //1h
                httpOnly: true,
            });
            res.cookie('refreshToken', refreshToken, {
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
                httpOnly: true,
            });
            res.status(201).json({ user });
        } catch (error) {
            next(error);
            return;
        }
    }
}
