import express from 'express';
import { AuthController } from '../controllers/AuthController';
import { UserService } from '../services/user.service';
const router = express.Router();
const userService = new UserService();
const authController = new AuthController(userService);

router.post('/register', (req, res) => authController.register(req, res));

export default router;
