import 'reflect-metadata';
import express, { NextFunction, Request, Response } from 'express';
import logger from './config/logger';
import { HttpError } from 'http-errors';
import AuthRouter from './routes/auth';
import TenantRouter from './routes/tenants';
import UserRouter from './routes/user';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();
app.use(
    cors({
        origin: ['http://localhost:5173'],
        credentials: true,
    }),
);

app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());

app.use('/auth', AuthRouter);
app.use('/tenants', TenantRouter);
app.use('/users', UserRouter);

//global error handler.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message);
    const statusCode = err.statusCode || err.status || 500;
    res.status(statusCode).json({
        errors: [
            {
                type: err.name,
                msg: err.message,
                path: '',
                location: '',
            },
        ],
    });
});
export default app;
