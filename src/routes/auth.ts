import express, { NextFunction, Request, Response } from 'express';
import { AuthController } from '../controllers/AuthController';
import { UserService } from '../services/user.service';
import logger from '../config/logger';
import { body } from 'express-validator';
const router = express.Router();
const userService = new UserService();
const authController = new AuthController(userService, logger);

router.post(
    '/register',
    [body('email').notEmpty()],
    (req: Request, res: Response, next: NextFunction) =>
        authController.register(req, res, next),
);

export default router;
