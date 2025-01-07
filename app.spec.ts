import app from './src/app';
import { calculateDiscount } from './src/utils';
import request from 'supertest';

describe('App', () => {
    it('It should return discount', () => {
        const disc = calculateDiscount(100, 10);
        expect(disc).toBe(10);
    });
    it('should return 200 status code', async () => {
        const response = await request(app).get('/').send();
        expect(response.statusCode).toBe(200);
    });
});
