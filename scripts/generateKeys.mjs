import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Get the path to the mern-app-pizza-auth-service directory
const authServiceDir = path.dirname(new URL(import.meta.url).pathname); // Get the current directory of the script

// Define the path to the certs folder inside mern-app-pizza-auth-service
const certsDir = path.join(authServiceDir, '..', 'certs'); // Move one directory up and then add 'certs'

// Ensure the certs directory exists
if (!fs.existsSync(certsDir)) {
    fs.mkdirSync(certsDir);
}

const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
        type: 'pkcs1',
        format: 'pem',
    },
    privateKeyEncoding: {
        type: 'pkcs1',
        format: 'pem',
    },
});

console.log('publicKey', publicKey);
console.log('privateKey', privateKey);

// Write the private and public keys to the certs folder inside mern-app-pizza-auth-service
fs.writeFileSync(path.join(certsDir, 'private.pem'), privateKey);
fs.writeFileSync(path.join(certsDir, 'public.pem'), publicKey);
