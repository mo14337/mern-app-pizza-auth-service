import express, { NextFunction, Request, Response } from 'express';
import { AuthController } from '../controllers/AuthController';
import { UserService } from '../services/user.service';
import logger from '../config/logger';
import loginValidators from '../validators/login-validator';
import registerValidators from '../validators/register-validators';
import { TokenService } from '../services/TokenService';
import { AppDataSource } from '../config/data-source';
import { RefreshToken } from '../entity/RefreshToken';
import { User } from '../entity/User';
import { CredentialsServices } from '../services/CredentialService';
import auuthenticate from '../middlewares/authenticate';
import { AuthRequest } from '../types';
import validateRefreshToken from '../middlewares/validateRefreshToken';
const router = express.Router();

//db repositores
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
const userRepository = AppDataSource.getRepository(User);

// dependency injections
const userService = new UserService(userRepository);
const tokenService = new TokenService(refreshTokenRepository);
const credentialService = new CredentialsServices();
const authController = new AuthController(
    userService,
    logger,
    tokenService,
    credentialService,
);

router.post(
    '/register',
    registerValidators,
    (req: Request, res: Response, next: NextFunction) =>
        authController.register(req, res, next),
);

router.post(
    '/login',
    loginValidators,
    (req: Request, res: Response, next: NextFunction) =>
        authController.login(req, res, next),
);
router.get(
    '/self',
    auuthenticate,
    loginValidators,
    (req: Request, res: Response) =>
        authController.self(req as AuthRequest, res),
);

router.post(
    '/refresh',
    validateRefreshToken,
    (req: Request, res: Response, next: NextFunction) =>
        authController.refresh(req as AuthRequest, res, next),
);

export default router;
