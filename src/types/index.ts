import { Request } from 'express';

export interface UserData {
    id?: number;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
    tenantId?: number;
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

export interface ITenantData {
    name: string;
    address: string;
}

export interface RegisterTenantRequest extends Request {
    body: ITenantData;
}

export interface CreateUserRequest extends Request {
    body: UserData;
}

export interface CreateUserRequest extends Request {
    body: UserData;
}

export interface LimitedUserData {
    firstName: string;
    lastName: string;
    role: string;
}

export interface UpdateUserRequest extends Request {
    body: LimitedUserData;
}

export interface PaginationParams {
    perPage: number;
    currentPage: number;
}
