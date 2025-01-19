import request from 'supertest';
import app from '../../src/app';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import { User } from '../../src/entity/User';
import { Roles } from '../../src/constants';
import bcrypt from 'bcrypt';
import { isJwt } from './utils';

describe('POST /auth/register', () => {
    let connection: DataSource;
    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        // db truncate
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterAll(async () => {
        await connection.destroy();
    });

    describe('Given all fields', () => {
        //Three A Principle(Arrange,Act,Assert)

        it('should return 201', async () => {
            //arrange
            const userData = {
                firstName: 'Mohit',
                lastName: 'Singh',
                email: 'mohit@gmail.com',
                password: 'secret',
            };

            //act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            //assert
            expect(response.statusCode).toBe(201);
        });

        it('should return valid json response', async () => {
            //arrange
            const userData = {
                firstName: 'Mohit',
                lastName: 'Singh',
                email: 'mohit@gmail.com',
                password: 'secret',
            };

            //act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            //assert
            expect(
                (response.headers as Record<string, string>)['content-type'],
            ).toEqual(expect.stringContaining('json'));
        });

        it('should presist user in database', async () => {
            //arrange
            const userData = {
                firstName: 'Mohit',
                lastName: 'Singh',
                email: 'mohit@gmail.com',
                password: 'secret',
            };

            //act
            await request(app).post('/auth/register').send(userData);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            //assert
            expect(users).toHaveLength(1);
            expect(users[0].firstName).toBe(userData.firstName);
            expect(users[0].lastName).toBe(userData.lastName);
            expect(users[0].email).toBe(userData.email);
        });

        it('should return id of the user', async () => {
            //arrange
            const userData = {
                firstName: 'Mohit',
                lastName: 'Singh',
                email: 'mohit@gmail.com',
                password: 'secret',
            };

            //act
            await request(app).post('/auth/register').send(userData);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            //assert
            expect(users[0].id).toBeDefined();
        });

        it('should assign a customer role', async () => {
            //arrange
            const userData = {
                firstName: 'Mohit',
                lastName: 'Singh',
                email: 'mohit@gmail.com',
                password: 'secret',
            };

            //act
            await request(app).post('/auth/register').send(userData);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            //assert
            expect(users[0]).toHaveProperty('role');
            expect(users[0].role).toBe(Roles.CUSTOMER);
        });

        it('should store the hashed password', async () => {
            //arrange
            const userData = {
                firstName: 'Mohit',
                lastName: 'Singh',
                email: 'mohit@gmail.com',
                password: 'secret',
            };

            //act
            await request(app).post('/auth/register').send(userData);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            const isMatch = await bcrypt.compare(
                userData.password,
                users[0].password,
            );

            // assert
            expect(isMatch).toBe(true);
        });

        it('should return 400 status code if email already exists', async () => {
            //arrange
            const userData = {
                firstName: 'Mohit',
                lastName: 'Singh',
                email: 'mohit@gmail.com',
                password: 'secret',
            };
            const userRepository = connection.getRepository(User);
            await userRepository.save({ ...userData, role: Roles.CUSTOMER });

            //act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            const users = await userRepository.find();

            // assert
            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(1);
        });

        it('should return the access token and refresh token', async () => {
            //arrange
            const userData = {
                firstName: 'Mohit',
                lastName: 'Singh',
                email: 'mohit@gmail.com',
                password: 'secret',
            };
            let accessToken = null;
            let refreshToken = null;

            //act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

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
        });
    });

    describe('Fields are missing', () => {
        it('should return 400 if email is missing', async () => {
            //arrange
            const userData = {
                firstName: 'Mohit',
                lastName: 'Singh',
                email: '',
                password: 'secret',
            };

            //act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            // assert
            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(0);
        });

        it('should return 400 status code if firstname is missing', async () => {
            //arrange
            const userData = {
                firstName: '',
                lastName: 'Singh',
                email: 'mohit@gmail.com',
                password: 'secret',
            };

            //act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            // assert
            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(0);
        });
        it('should return 400 status code if lastname is missing', async () => {
            //arrange
            const userData = {
                firstName: 'Mohit',
                lastName: '',
                email: 'mohit@gmail.com',
                password: 'secret',
            };

            //act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            // assert
            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(0);
        });
        it('should return 400 status code if password is missing', async () => {
            //arrange
            const userData = {
                firstName: 'Mohit',
                lastName: 'Singh',
                email: 'mohit@gmail.com',
                password: '',
            };

            //act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            // assert
            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(0);
        });
    });

    describe('Fields are not in proper formate', () => {
        it('should trim the email field', async () => {
            //arrange
            const userData = {
                firstName: 'Mohit',
                lastName: 'Singh',
                email: ' mohit@gmail.com ',
                password: 'secret',
            };

            //act
            await request(app).post('/auth/register').send(userData);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            const user = users[0];

            // assert
            expect(user.email).toBe('mohit@gmail.com');
        });

        it('should return 400 status code if password length is less than 6 characters', async () => {
            //arrange
            const userData = {
                firstName: 'Mohit',
                lastName: 'Singh',
                email: 'mohit@gmail.com',
                password: 'xyz',
            };

            //act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            // assert
            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(0);
        });
        it('should return 400 status code if email is not valid', async () => {
            //arrange
            const userData = {
                firstName: 'Mohit',
                lastName: 'Singh',
                email: 'mohitgmail.com',
                password: 'seceret',
            };

            //act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            // assert
            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(0);
        });
    });
});
