import { expressjwt, GetVerificationKey } from 'express-jwt';
import jwksClient from 'jwks-rsa';
import { Config } from '../config';
import { Request } from 'express';

// JWT Middleware for Authentication
const jwtMiddleware = expressjwt({
    secret: jwksClient.expressJwtSecret({
        jwksUri: Config.JWKS_URI!,
        cache: true,
        rateLimit: true,
    }) as unknown as GetVerificationKey,
    algorithms: ['RS256'],
    getToken(req: Request) {
        const authHeader = req?.headers?.authorization;
        console.log(req);
        if (authHeader?.split(' ')[1] !== undefined) {
            const token = authHeader?.split(' ')[1];
            if (token) {
                return token;
            }
        }

        const { accessToken } = req?.cookies as Record<string, string>;
        return accessToken;
    },
});

export default jwtMiddleware;
