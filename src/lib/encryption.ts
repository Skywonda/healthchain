import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

export class EncryptionService {
  private static getKey(): Buffer {
    const key = process.env.ENCRYPTION_KEY;
    if (!key || key.length !== KEY_LENGTH * 2) { 
      throw new Error('Invalid encryption key. Must be 32 bytes (64 hex characters)');
    }
    return Buffer.from(key, 'hex');
  }

  static encrypt(text: string): string {
    try {
      const key = this.getKey();
      const iv = crypto.randomBytes(IV_LENGTH);
      const cipher = crypto.createCipher(ALGORITHM, key);
      cipher.setAAD(Buffer.from('healthchain', 'utf8'));

      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const tag = cipher.getAuthTag();
      
      return iv.toString('hex') + tag.toString('hex') + encrypted;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  static decrypt(encryptedData: string): string {
    try {
      const key = this.getKey();
      
      const iv = Buffer.from(encryptedData.slice(0, IV_LENGTH * 2), 'hex');
      const tag = Buffer.from(encryptedData.slice(IV_LENGTH * 2, (IV_LENGTH + TAG_LENGTH) * 2), 'hex');
      const encrypted = encryptedData.slice((IV_LENGTH + TAG_LENGTH) * 2);
      
      const decipher = crypto.createDecipher(ALGORITHM, key);
      decipher.setAuthTag(tag);
      decipher.setAAD(Buffer.from('healthchain', 'utf8'));
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  static hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  static generateFileHash(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }
}

export const clientEncrypt = {
  async encryptSensitiveData(data: any): Promise<string> {
    return JSON.stringify(data);
  },

  async decryptSensitiveData(encryptedData: string): Promise<any> {
    try {
      return JSON.parse(encryptedData);
    } catch {
      return null;
    }
  }
};