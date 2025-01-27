import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import app from '../../src/app';
import request from 'supertest';
import createJWKSMock, { JWKSMock } from 'mock-jwks';
import { Roles } from '../../src/constants';
import { User } from '../../src/entity/User';

describe('POST /users', () => {
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
        it.skip('It should return 201 status code', async () => {
            const accessToken = jwks.token({ sub: '1', role: Roles.ADMIN });

            // Create and save user in the database
            const userData = {
                firstName: 'Mohit',
                lastName: 'Singh',
                email: 'mohit@gmail.com',
                password: 'password',
                tenantId: 1,
            };

            const response = await request(app)
                .post('/users')
                .set('Cookie', [`accessToken=${accessToken}`])
                .send(userData);

            expect(response.statusCode).toBe(201);
        });
        it('should create user in database', async () => {
            const accessToken = jwks.token({ sub: '1', role: Roles.ADMIN });
            const userRepository = connection.getRepository(User);

            // Create and save user in the database
            const userData = {
                firstName: 'Mohit',
                lastName: 'Singh',
                email: 'mohit@gmail.com',
                password: 'password',
                tenantId: 1,
            };

            await request(app)
                .post('/users')
                .set('Cookie', [`accessToken=${accessToken}`])
                .send(userData);

            const users = await userRepository.find();
            expect(users).toHaveLength(1);
            expect(users[0].email).toBe(userData.email);
        });

        it('should create user with manager in database', async () => {
            const accessToken = jwks.token({ sub: '1', role: Roles.ADMIN });
            const userRepository = connection.getRepository(User);

            // Create and save user in the database
            const userData = {
                firstName: 'Mohit',
                lastName: 'Singh',
                email: 'mohit@gmail.com',
                password: 'password',
                tenantId: 1,
            };

            await request(app)
                .post('/users')
                .set('Cookie', [`accessToken=${accessToken}`])
                .send(userData);

            const users = await userRepository.find();
            expect(users).toHaveLength(1);
            expect(users[0].role).toBe(Roles.MANAGER);
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
