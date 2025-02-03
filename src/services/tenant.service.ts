import { Repository } from 'typeorm';
import { ITenantData } from '../types';
import { Tenant } from '../entity/Tenants';
import createHttpError from 'http-errors';

export class TenantServices {
    constructor(private readonly tenantRepository: Repository<Tenant>) {}
    async createTenant(tenantData: ITenantData) {
        try {
            const tenant = await this.tenantRepository.save(tenantData);
            return tenant;

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            const err = createHttpError(
                500,
                'Failed to store data in database',
            );
            throw err;
        }
    }

    async update(id: number, tenantData: ITenantData) {
        try {
            return await this.tenantRepository.update(id, tenantData);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            const err = createHttpError(
                500,
                'Failed to store data in database',
            );
            throw err;
        }
    }

    async getAll() {
        return await this.tenantRepository.find();
    }

    async getById(tenantId: number) {
        return await this.tenantRepository.findOne({ where: { id: tenantId } });
    }

    async deleteById(tenantId: number) {
        return await this.tenantRepository.delete(tenantId);
    }
}
