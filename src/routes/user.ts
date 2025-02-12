import express, { NextFunction, Request, Response } from 'express';
import authenticate from '../middlewares/authenticate';
import { AppDataSource } from '../config/data-source';
import logger from '../config/logger';
import { canAccess } from '../middlewares/canAccess';
import { Roles } from '../constants';
import { User } from '../entity/User';
import { UserController } from '../controllers/UserController';
import { UserService } from '../services/user.service';
import { CreateUserRequest, UpdateUserRequest } from '../types';
import registerValidators from '../validators/register-validators';
import updateUserValidator from '../validators/update-user-validator';
import listUserValidator from '../validators/list-user-validator';
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
router.patch(
    '/:id',
    authenticate,
    canAccess([Roles.ADMIN]),
    updateUserValidator,
    (req: UpdateUserRequest, res: Response, next: NextFunction) =>
        userController.update(req, res, next),
);

router.get(
    '/',
    authenticate,
    canAccess([Roles.ADMIN]),
    listUserValidator,
    (req: Request, res: Response, next: NextFunction) =>
        userController.getAll(req, res, next),
);

router.get('/:id', authenticate, canAccess([Roles.ADMIN]), (req, res, next) =>
    userController.getOne(req, res, next),
);

router.delete(
    '/:id',
    authenticate,
    canAccess([Roles.ADMIN]),
    (req, res, next) => userController.destroy(req, res, next),
);

export default router;
