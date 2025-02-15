import { checkSchema, Meta } from 'express-validator';
import { UpdateUserRequest } from '../types';

export default checkSchema({
    firstName: {
        errorMessage: 'First name is required!',
        notEmpty: true,
        trim: true,
    },
    lastName: {
        errorMessage: 'Last name is required!',
        notEmpty: true,
        trim: true,
    },
    role: {
        errorMessage: 'Role is required!',
        notEmpty: true,
        trim: true,
    },
    tenantId: {
        errorMessage: 'Tenant id is required!',
        trim: true,
        custom: {
            options: (value: string, meta: Meta) => {
                const req = meta.req as UpdateUserRequest;
                const role = req.body.role;
                if (role === 'admin') {
                    return true;
                } else {
                    return !!value;
                }
            },
        },
    },
});
