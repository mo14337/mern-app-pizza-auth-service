import bcrypt from 'bcrypt';
export class CredentialsServices {
    async comparePassword(userPassword: string, passwordHash: string) {
        return await bcrypt.compare(userPassword, passwordHash);
    }
}
