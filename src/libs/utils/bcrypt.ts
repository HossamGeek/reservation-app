import bcrypt from 'bcryptjs';

export function encodePassword(password: string) {
    const SALT = bcrypt.genSaltSync();
    return bcrypt.hash(password, SALT);
}

export function comparePasswords(password: string, hashedPassword: string) {
    return bcrypt.compareSync(password, hashedPassword);
}