import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import app from '../../src/app';
import request from 'supertest';

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
                adddress: 'Tenant address',
            };
            //act
            const response = await request(app)
                .post('/tenants')
                .send(tenantData);
            //assert

            expect(response.statusCode).toBe(201);
        });
    });

    //sad path
    describe('Fields are missing', () => {});
});
