import bcrypt from 'bcryptjs';
export class CredentialsServices {
    async comparePassword(userPassword: string, passwordHash: string) {
        return await bcrypt.compare(userPassword, passwordHash);
    }
}
