import { Request } from 'express';

export interface UserData {
    id?: number;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface RegisterUserRequest extends Request {
    body: UserData;
}

export interface AuthRequest extends Request {
    auth: {
        sub: number;
        role: string;
        id?: number;
    };
}

export interface IRefreshTokenPayload {
    id: string;
}
