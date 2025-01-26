import { NextFunction, Response } from 'express';
import { TenantServices } from '../services/tenant.service';
import { RegisterTenantRequest } from '../types';
import { Logger } from 'winston';

export class TenantController {
    constructor(
        private tenantService: TenantServices,
        private logger: Logger,
    ) {}
    async create(
        req: RegisterTenantRequest,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const { name, address } = req.body;
            const tenant = await this.tenantService.createTenant({
                name,
                address,
            });
            this.logger.info('TEnant has been created ', { id: tenant.id });
            res.status(201).json(tenant);
        } catch (error) {
            next(error);
        }
    }
}
