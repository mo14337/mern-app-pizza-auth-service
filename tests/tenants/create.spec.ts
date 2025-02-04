import { DataSource, NumericType, Repository } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import app from '../../src/app';
import request from 'supertest';
import { Tenant } from '../../src/entity/Tenants';
import createJWKSMock, { JWKSMock } from 'mock-jwks';
import { Roles } from '../../src/constants';
import { ITenantData } from '../../src/types';

describe('POST /tenants', () => {
    let connection: DataSource;
    let jwks: JWKSMock;
    beforeAll(async () => {
        jwks = createJWKSMock('http://localhost:5002');
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        jwks.start();
        // db truncate
        await connection?.dropDatabase();
        await connection?.synchronize();
    });
    afterEach(() => {
        jwks.stop();
    });

    afterAll(async () => {
        await connection?.destroy();
    });

    //happy path

    describe('Given all fields', () => {
        it('It should return 201 status code', async () => {
            const accessToken = jwks.token({ sub: '1', role: Roles.ADMIN });
            //arrange
            const tenantData = {
                name: 'Tenant name',
                address: 'Tenant address',
            };
            //act
            const response = await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${accessToken}`])
                .send(tenantData);
            //assert

            expect(response.statusCode).toBe(201);
        });
        it('It should create tenant in database', async () => {
            const accessToken = jwks.token({ sub: '1', role: Roles.ADMIN });
            //arrange
            const tenantData = {
                name: 'Tenant name',
                address: 'Tenant address',
            };
            //act
            const response = await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${accessToken}`])
                .send(tenantData);

            const tenantRepository = connection.getRepository(Tenant);
            const tenants = await tenantRepository.find();

            //assert

            expect(tenants).toHaveLength(1);
            expect((response.body as Record<string, string>).name).toBe(
                'Tenant name',
            );
        });

        it('should return 401 if user is not authenticated', async () => {
            //arrange
            const tenantData = {
                name: 'Tenant name',
                address: 'Tenant address',
            };
            //act
            const response = await request(app)
                .post('/tenants')
                .send(tenantData);

            const tenantRepository = connection.getRepository(Tenant);
            const tenants = await tenantRepository.find();

            //assert

            expect(tenants).toHaveLength(0);
            expect(response.statusCode).toBe(401);
        });

        it('should return 403 if user is not admin', async () => {
            const accessToken = jwks.token({ sub: '1', role: Roles.MANAGER });
            //arrange
            const tenantData = {
                name: 'Tenant name',
                address: 'Tenant address',
            };
            //act
            const response = await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${accessToken}`])
                .send(tenantData);

            const tenantRepository = connection.getRepository(Tenant);
            const tenants = await tenantRepository.find();

            //assert

            expect(tenants).toHaveLength(0);
            expect(response.statusCode).toBe(403);
        });
    });

    //sad path
    describe('Fields are missing', () => {
        it('should return 400 if fields are missing', async () => {
            const accessToken = jwks.token({ sub: '1', role: Roles.ADMIN });
            //arrange
            const tenantData = {
                name: 'Tenant name',
            };
            //act
            const response = await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${accessToken}`])
                .send(tenantData);
            //assert

            expect(response.statusCode).toBe(400);
        });
    });
});
describe('PATCH /tenants/:id', () => {
    interface tenant extends ITenantData {
        id?: number;
    }
    let connection: DataSource;
    let jwks: JWKSMock;
    let tenantRepository: Repository<Tenant>;
    let tenant: tenant;
    let accessToken: string;

    beforeAll(async () => {
        jwks = createJWKSMock('http://localhost:5002');
        connection = await AppDataSource.initialize();
        tenantRepository = connection.getRepository(Tenant);
    });

    beforeEach(async () => {
        jwks.start();
        // db truncate and synchronize
        await connection?.dropDatabase();
        await connection?.synchronize();

        // Create a tenant for testing
        const tenantData = {
            name: 'Old Tenant Name',
            address: 'Old Tenant Address',
        };
        tenant = await tenantRepository.save(tenantData);
        accessToken = jwks.token({ sub: '1', role: Roles.ADMIN });
    });

    afterEach(() => {
        jwks.stop();
    });

    afterAll(async () => {
        await connection?.destroy();
    });

    it('should update the tenant details successfully', async () => {
        const updatedTenantData = {
            name: 'Updated Tenant Name',
            address: 'Updated Tenant Address',
        };

        const response = await request(app)
            .patch(`/tenants/${tenant?.id}`)
            .set('Cookie', [`accessToken=${accessToken}`])
            .send(updatedTenantData);

        const updatedTenant = await tenantRepository.findOne({
            where: { id: Number(tenant.id) },
        });

        expect(response.status).toBe(200);
        expect(updatedTenant).toBeDefined();
        expect(updatedTenant!.name).toBe(updatedTenantData.name);
        expect(updatedTenant!.address).toBe(updatedTenantData.address);
    });

    it.skip('should return a 404 if tenant does not exist', async () => {
        const updatedTenantData = {
            name: 'Non Existent Tenant',
            address: 'Non Existent Address',
        };

        const response = await request(app)
            .patch('/tenants/99999') // assuming 99999 does not exist
            .set('Cookie', [`accessToken=${accessToken}`])
            .send(updatedTenantData);

        expect(response.status).toBe(404);
    });

    it('should return 403 if user is not admin', async () => {
        const accessToken = jwks.token({ sub: '1', role: Roles.MANAGER });
        const updatedTenantData = {
            name: 'Updated Tenant Name',
            address: 'Updated Tenant Address',
        };

        const response = await request(app)
            .patch(`/tenants/${tenant.id}`)
            .set('Cookie', [`accessToken=${accessToken}`])
            .send(updatedTenantData);

        expect(response.status).toBe(403);
    });
});
