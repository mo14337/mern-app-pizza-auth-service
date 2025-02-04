import { DataSource, Repository } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import app from '../../src/app';
import request from 'supertest';
import createJWKSMock, { JWKSMock } from 'mock-jwks';
import { Roles } from '../../src/constants';
import { User } from '../../src/entity/User';
import { createTenant } from '../../src/utils';
import { Tenant } from '../../src/entity/Tenants';
import { UserData } from '../../src/types';

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
        it('should create user in database', async () => {
            const tenant = await createTenant(connection.getRepository(Tenant));
            const accessToken = jwks.token({ sub: '1', role: Roles.ADMIN });
            const userRepository = connection.getRepository(User);

            // Create and save user in the database
            const userData = {
                firstName: 'Mohit',
                lastName: 'Singh',
                email: 'mohit@gmail.com',
                password: 'password',
                tenantId: tenant.id,
                role: Roles.MANAGER,
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
            const tenant = await createTenant(connection.getRepository(Tenant));

            const accessToken = jwks.token({ sub: '1', role: Roles.ADMIN });

            // Create and save user in the database
            const userData = {
                firstName: 'Mohit',
                lastName: 'Singh',
                email: 'mohit@gmail.com',
                password: 'password',
                tenantId: tenant.id,
                role: Roles.MANAGER,
            };

            const userRepository = connection.getRepository(User);
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
});
