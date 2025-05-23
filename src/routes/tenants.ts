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
import listUserValidator from '../validators/list-user-validator';
import { Request } from 'express-jwt';
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

router.patch(
    '/:id',
    authenticate,
    canAccess([Roles.ADMIN]),
    tenantValidator,
    (req: RegisterTenantRequest, res: Response, next: NextFunction) =>
        tenantController.update(req, res, next),
);
router.get(
    '/',
    listUserValidator,
    (req: Request, res: Response, next: NextFunction) =>
        tenantController.getAll(req, res, next),
);
router.get('/:id', authenticate, canAccess([Roles.ADMIN]), (req, res, next) =>
    tenantController.getOne(req, res, next),
);
router.delete(
    '/:id',
    authenticate,
    canAccess([Roles.ADMIN]),
    (req, res, next) => tenantController.destroy(req, res, next),
);

export default router;
