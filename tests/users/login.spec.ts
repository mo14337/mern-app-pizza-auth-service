import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import app from '../../src/app';
import request from 'supertest';
import { User } from '../../src/entity/User';
import bcrypt from 'bcrypt';
import { Roles } from '../../src/constants';

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
        it('should login the user if credentials are correct', async () => {
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

            // Assert
            expect(response.statusCode).toBe(200); // Adjust if the API uses a different status code for success
        });

        it.todo('should login the user');
    });

    //sad path

    describe('fields are missing', () => {
        it.todo('should login the user');
    });
});
