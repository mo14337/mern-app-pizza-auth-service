import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import app from '../../src/app';
import request from 'supertest';
import { Tenant } from '../../src/entity/Tenants';

describe('POST /tenants', () => {
    let connection: DataSource;
    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        // db truncate
        await connection?.dropDatabase();
        await connection?.synchronize();
    });

    afterAll(async () => {
        await connection?.destroy();
    });

    //happy path

    describe('Given all fields', () => {
        it('It should return 201 status code', async () => {
            //arrange
            const tenantData = {
                name: 'Tenant name',
                address: 'Tenant address',
            };
            //act
            const response = await request(app)
                .post('/tenants')
                .send(tenantData);
            //assert

            expect(response.statusCode).toBe(201);
        });
        it('It should create tenant in database', async () => {
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

            expect(tenants).toHaveLength(1);
            expect((response.body as Record<string, string>).name).toBe(
                'Tenant name',
            );
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
