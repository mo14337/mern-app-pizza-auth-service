import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import app from '../../src/app';
import request from 'supertest';
import { Tenant } from '../../src/entity/Tenants';
import createJWKSMock, { JWKSMock } from 'mock-jwks';
import { Roles } from '../../src/constants';

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
        it.skip('should return 400 if fields are missing', async () => {
            //arrange
            const tenantData = {
                name: 'Tenant name',
            };
            //act
            const response = await request(app)
                .post('/tenants')
                .send(tenantData);
            //assert

            expect(response.statusCode).toBe(400);
        });
    });
});
