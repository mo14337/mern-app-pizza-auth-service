import express, { NextFunction, Request, Response } from 'express';
import { AuthController } from '../controllers/AuthController';
import { UserService } from '../services/user.service';
import logger from '../config/logger';
import registerValidators from '../validators/register-validators';
import { TokenService } from '../services/TokenService';
import { AppDataSource } from '../config/data-source';
import { RefreshToken } from '../entity/RefreshToken';
import { User } from '../entity/User';
const router = express.Router();

//db repositores
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
const userRepository = AppDataSource.getRepository(User);

// dependency injections
const userService = new UserService(userRepository);
const tokenService = new TokenService(refreshTokenRepository);
const authController = new AuthController(userService, logger, tokenService);

router.post(
    '/register',
    registerValidators,
    (req: Request, res: Response, next: NextFunction) =>
        authController.register(req, res, next),
);

export default router;
