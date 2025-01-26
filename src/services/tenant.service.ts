import { Repository } from 'typeorm';
import { ITenantData } from '../types';
import { Tenant } from '../entity/Tenants';
import createHttpError from 'http-errors';

export class TenantServices {
    constructor(private tenantRepository: Repository<Tenant>) {}
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
}
