import express, { NextFunction, Response } from 'express';
import { TenantController } from '../controllers/TenantController';
import { TenantServices } from '../services/tenant.service';
import authenticate from '../middlewares/authenticate';
import { RegisterTenantRequest } from '../types';
import { AppDataSource } from '../config/data-source';
import { Tenant } from '../entity/Tenants';
import logger from '../config/logger';
import { canAccess } from '../middlewares/canAccess';
import { Roles } from '../constants';
import tenantValidator from '../validators/tenant-validator';
const router = express.Router();

const tenantRepository = AppDataSource.getRepository(Tenant);
const tenantService = new TenantServices(tenantRepository);
const tenantController = new TenantController(tenantService, logger);

router.post(
    '/',
    authenticate,
    canAccess([Roles.ADMIN]),
    tenantValidator,
    (req: RegisterTenantRequest, res: Response, next: NextFunction) =>
        tenantController.create(req, res, next),
);

export default router;
