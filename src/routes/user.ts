import express, { NextFunction, Response } from 'express';
import authenticate from '../middlewares/authenticate';
import { AppDataSource } from '../config/data-source';
import logger from '../config/logger';
import { canAccess } from '../middlewares/canAccess';
import { Roles } from '../constants';
import { User } from '../entity/User';
import { UserController } from '../controllers/UserController';
import { UserService } from '../services/user.service';
import { CreateUserRequest } from '../types';
import registerValidators from '../validators/register-validators';
const router = express.Router();

const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const userController = new UserController(userService, logger);

router.post(
    '/',
    authenticate,
    canAccess([Roles.ADMIN]),
    registerValidators,
    (req: CreateUserRequest, res: Response, next: NextFunction) =>
        userController.create(req, res, next),
);

export default router;
