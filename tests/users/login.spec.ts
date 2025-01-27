import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import app from '../../src/app';
import request from 'supertest';
import { User } from '../../src/entity/User';
import bcrypt from 'bcrypt';
import { Roles } from '../../src/constants';
import { isJwt } from '../../src/utils';

describe('POST auth/login', () => {
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
        it('should login the user and have access token ,refresh token if credentials are correct ', async () => {
            const userRepository = connection.getRepository(User);

            // Create and save user in the database
            const hashedPassword = await bcrypt.hash('secret', 10);
            await userRepository.save({
                firstName: 'Mohit',
                lastName: 'Singh',
                email: 'mohit@gmail.com',
                password: hashedPassword,
                role: Roles.CUSTOMER,
            });

            // Mock login data
            const userData = {
                email: 'mohit@gmail.com',
                password: 'secret',
            };

            // Act
            const response = await request(app)
                .post('/auth/login')
                .send(userData);
            let accessToken = null;
            let refreshToken = null;

            interface Headers {
                ['set-cookie']?: string[];
            }

            const cookies = (response.headers as Headers)['set-cookie'] || [];
            cookies.forEach((cookie) => {
                if (cookie.startsWith('accessToken=')) {
                    accessToken = cookie.split(';')[0].split('=')[1];
                }
                if (cookie.startsWith('refreshToken=')) {
                    refreshToken = cookie.split(';')[0].split('=')[1];
                }
            });

            // assert
            expect(accessToken).not.toBeNull();
            expect(refreshToken).not.toBeNull();
            expect(isJwt(accessToken)).toBeTruthy();
            expect(isJwt(refreshToken)).toBeTruthy();
            expect(response.statusCode).toBe(200); // Adjust if the API uses a different status code for success
        });
    });

    //sad path

    describe('fields are missing', () => {
        it('should return 400 if credentials are not correct', async () => {
            const userRepository = connection.getRepository(User);

            // Create and save user in the database
            const hashedPassword = await bcrypt.hash('secret', 10);
            await userRepository.save({
                firstName: 'Mohit',
                lastName: 'Singh',
                email: 'mohit@gmail.com',
                password: hashedPassword,
                role: Roles.CUSTOMER,
            });

            // Mock login data
            const userData = {
                email: 'mohit@gmail.com',
                password: 'secreta',
            };

            // Act
            const response = await request(app)
                .post('/auth/login')
                .send(userData);

            // Assert
            expect(response.statusCode).toBe(400); // Adjust if the API uses a different status code for success
        });
    });
});
