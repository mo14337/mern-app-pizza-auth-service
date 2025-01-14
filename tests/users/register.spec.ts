import request from 'supertest';
import app from '../../src/app';

describe('POST /auth/register', () => {
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
    });

    describe('Fields are missing', () => {});
});
