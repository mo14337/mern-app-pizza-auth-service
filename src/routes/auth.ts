import express from 'express';
import { AuthController } from '../controllers/AuthController';
import { UserService } from '../services/user.service';
import logger from '../config/logger';
const router = express.Router();
const userService = new UserService();
const authController = new AuthController(userService, logger);

router.post('/register', (req, res, next) =>
    authController.register(req, res, next),
);

export default router;
