import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';

describe('POST auth/login', () => {
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

    //happy path

    describe('Given all fields', () => {
        it.todo('should login the user');
    });

    //sad path

    describe('fields are missing', () => {
        it.todo('should login the user');
    });
});
