import * as crypto from 'crypto';

export function generateHash(stringData: string): string {
    return crypto.createHash('sha256').update(stringData).digest('hex');
}