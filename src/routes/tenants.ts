import express, { Request, Response } from 'express';
import { TenantController } from '../controllers/TenantController';
const router = express.Router();

const tenantController = new TenantController();
router
    .route('/')
    .post((req: Request, res: Response) => tenantController.create(req, res));

export default router;
