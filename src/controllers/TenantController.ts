import { NextFunction, Request, Response } from 'express';
import { TenantServices } from '../services/tenant.service';
import { PaginationParams, RegisterTenantRequest } from '../types';
import { Logger } from 'winston';
import { matchedData, validationResult } from 'express-validator';
import createHttpError from 'http-errors';

export class TenantController {
    constructor(
        private readonly tenantService: TenantServices,
        private readonly logger: Logger,
    ) {}
    async create(
        req: RegisterTenantRequest,
        res: Response,
        next: NextFunction,
    ) {
        // Validation
        const result = validationResult(req);
        if (!result.isEmpty()) {
            const error = createHttpError(400, 'Invalid req');
            next(error);
        }
        try {
            const { name, address } = req.body;
            const tenant = await this.tenantService.createTenant({
                name,
                address,
            });
            this.logger.info('Tenant has been created ', { id: tenant.id });
            res.status(201).json(tenant);
        } catch (error) {
            next(error);
        }
    }
    async update(
        req: RegisterTenantRequest,
        res: Response,
        next: NextFunction,
    ) {
        // Validation
        const result = validationResult(req);
        if (!result.isEmpty()) {
            const error = createHttpError(400, 'Invalid req');
            next(error);
        }

        const { name, address } = req.body;
        const tenantId = req.params.id;

        if (isNaN(Number(tenantId))) {
            next(createHttpError(400, 'Invalid url param.'));
            return;
        }

        this.logger.debug('Request for updating a tenant', req.body);

        try {
            await this.tenantService.update(Number(tenantId), {
                name,
                address,
            });

            this.logger.info('Tenant has been updated', { id: tenantId });

            res.json({ id: Number(tenantId) });
        } catch (err) {
            next(err);
        }
    }

    async getAll(req: Request, res: Response, next: NextFunction) {
        const validQuery = matchedData(req, { onlyValidData: true });
        try {
            const [tenants, count] = await this.tenantService.getAll(
                validQuery as PaginationParams,
            );

            this.logger.info('All tenant have been fetched');
            res.json({
                data: tenants,
                currentPage: validQuery.currentPage as number,
                perPage: validQuery.perPage as number,
                total: count,
            });
        } catch (err) {
            next(err);
        }
    }

    async getOne(req: Request, res: Response, next: NextFunction) {
        const tenantId = req.params.id;

        if (isNaN(Number(tenantId))) {
            next(createHttpError(400, 'Invalid url param.'));
            return;
        }

        try {
            const tenant = await this.tenantService.getById(Number(tenantId));

            if (!tenant) {
                next(createHttpError(400, 'Tenant does not exist.'));
                return;
            }

            this.logger.info('Tenant has been fetched');
            res.json(tenant);
        } catch (err) {
            next(err);
        }
    }

    async destroy(req: Request, res: Response, next: NextFunction) {
        const tenantId = req.params.id;

        if (isNaN(Number(tenantId))) {
            next(createHttpError(400, 'Invalid url param.'));
            return;
        }

        try {
            await this.tenantService.deleteById(Number(tenantId));

            this.logger.info('Tenant has been deleted', {
                id: Number(tenantId),
            });
            res.json({ id: Number(tenantId) });
        } catch (err) {
            next(err);
        }
    }
}
