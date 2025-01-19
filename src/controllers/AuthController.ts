import { NextFunction, Response } from 'express';
import { UserService } from '../services/user.service';
import { Logger } from 'winston';
import { validationResult } from 'express-validator';
import { JwtPayload } from 'jsonwebtoken';
import { AppDataSource } from '../config/data-source';
import { RefreshToken } from '../entity/RefreshToken';
import { TokenService } from '../services/TokenService';
import { RegisterUserRequest } from '../types';

export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
        private tokenService: TokenService,
    ) {}

    async register(
        req: RegisterUserRequest,
        res: Response,
        next: NextFunction,
    ) {
        //validation
        const result = validationResult(req);
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
            // let privateKey;
            // try {
            //     privateKey = fs.readFileSync(
            //         path.join(__dirname, '../../certs/private.pem'),
            //     );

            //     // eslint-disable-next-line @typescript-eslint/no-unused-vars
            // } catch (err) {
            //     const error = createHttpError(
            //         500,
            //         'Error while reading private key',
            //     );
            //     next(error);
            //     return;
            // }
            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            // const accessToken = sign(payload, privateKey, {
            //     algorithm: 'RS256',
            //     expiresIn: '1h',
            //     issuer: 'auth-service',
            // });

            const accessToken = this.tokenService.generateAccessToken(payload);

            //presist refresh token in db

            const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365; // -> 1 Year

            const refreshTokenRepository =
                AppDataSource.getRepository(RefreshToken);
            const newRefreshToken = await refreshTokenRepository.save({
                user: user,
                expiresAt: new Date(Date.now() + MS_IN_YEAR),
            });
            // console.log(newRefreshToken)

            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: newRefreshToken.id,
            });

            // send and save tokens in cookies
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
            res.status(201).json({ id: user.id });
        } catch (error) {
            next(error);
            return;
        }
    }
}
