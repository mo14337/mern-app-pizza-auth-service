import { checkSchema } from 'express-validator';

export default checkSchema({
    email: {
        errorMessage: 'Email is required',
        notEmpty: true,
        trim: true,
        isEmail: true,
    },
    firstName: {
        errorMessage: 'First name is required',
        notEmpty: true,
        trim: true,
    },
    lastName: {
        errorMessage: 'Last name is required',
        notEmpty: true,
        trim: true,
    },
    password: {
        errorMessage: 'password is required',
        notEmpty: true,
        isLength: {
            options: { min: 6 },
            errorMessage: 'Password should be at least 6 chars',
        },
    },
});
