import 'reflect-metadata';
import express from 'express';
import AuthRouter from './routes/auth';
import TenantRouter from './routes/tenants';
import UserRouter from './routes/user';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { GlobalErrorHandler } from './middlewares/GlobalErrorHandler';
import { Config } from './config';

const allowedOrigins = [Config.CLIENT_URL, Config.ADMIN_URL];
const app = express();
app.use(
    cors({
        origin: allowedOrigins as string[],
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
app.use(GlobalErrorHandler);
export default app;
