import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import app from '../../src/app';
import request from 'supertest';
import { User } from '../../src/entity/User';
import { Roles } from '../../src/constants';
import createJWKSMock, { JWKSMock } from 'mock-jwks';

describe('POST auth/login', () => {
    let connection: DataSource;
    let jwks: JWKSMock;
    beforeAll(async () => {
        jwks = createJWKSMock('http://localhost:5501');
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

    describe('GET auth/self', () => {
        it('Should return the 200 status code', async () => {
            const accessToken = jwks.token({ sub: '1', role: 'any' });

            const response = await request(app)
                .get('/auth/self')
                .set('Cookie', [`accessToken=${accessToken}`])
                .send();
            expect(response.statusCode).toBe(200);
        });

        it('Should return the user data', async () => {
            const userRepository = connection.getRepository(User);

            // Create and save user in the database
            const user = await userRepository.save({
                firstName: 'Mohit',
                lastName: 'Singh',
                email: 'mohit@gmail.com',
                password: 'password',
                role: Roles.CUSTOMER,
            });

            const accessToken = jwks.token({
                sub: String(user.id),
                role: user.role,
            });

            const response = await request(app)
                .get('/auth/self')
                .set('Cookie', [`accessToken=${accessToken}`])
                .send();
            expect((response.body as Record<string, string>).id).toBe(user.id);
        });
    });
});
