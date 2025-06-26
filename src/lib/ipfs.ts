// lib/ipfs.ts
import { create as createIPFS } from 'kubo-rpc-client';

interface IPFSConfig {
  url: string;
  projectId?: string;
  projectSecret?: string;
}

export class IPFSService {
  private ipfs: any;
  private isInitialized = false;

  constructor(config: IPFSConfig) {
    const auth = config.projectId && config.projectSecret 
      ? `Basic ${Buffer.from(`${config.projectId}:${config.projectSecret}`).toString('base64')}`
      : undefined;

    this.ipfs = createIPFS({
      url: config.url,
      timeout: 60000,
      headers: auth ? { authorization: auth } : undefined,
    });
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      await this.ipfs.id();
      this.isInitialized = true;
    } catch (error) {
      console.error('IPFS initialization failed:', error);
      throw new Error('Failed to connect to IPFS node');
    }
  }

  async uploadFile(file: File, encrypt: boolean = true): Promise<{
    hash: string;
    size: number;
    encryptionKey?: string;
  }> {
    await this.initialize();

    try {
      const buffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(buffer);
      
      let dataToUpload = uint8Array;
      let encryptionKey: string | undefined;

      if (encrypt) {
        encryptionKey = this.generateEncryptionKey();
        const encrypted = await this.encryptData(uint8Array, encryptionKey);
        dataToUpload = encrypted;
      }

      const result = await this.ipfs.add(dataToUpload, {
        progress: (prog: number) => console.log(`Uploading: ${prog}`),
        pin: true,
      });

      return {
        hash: result.path,
        size: result.size,
        encryptionKey,
      };
    } catch (error) {
      console.error('IPFS upload error:', error);
      throw new Error('Failed to upload file to IPFS');
    }
  }

  async downloadFile(hash: string, encryptionKey?: string): Promise<Uint8Array> {
    await this.initialize();

    try {
      const chunks = [];
      for await (const chunk of this.ipfs.cat(hash)) {
        chunks.push(chunk);
      }

      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      const data = new Uint8Array(totalLength);
      let offset = 0;
      
      for (const chunk of chunks) {
        data.set(chunk, offset);
        offset += chunk.length;
      }

      if (encryptionKey) {
        return await this.decryptData(data, encryptionKey);
      }

      return data;
    } catch (error) {
      console.error('IPFS download error:', error);
      throw new Error('Failed to download file from IPFS');
    }
  }

  async uploadJSON(data: any, encrypt: boolean = true): Promise<{
    hash: string;
    size: number;
    encryptionKey?: string;
  }> {
    const jsonString = JSON.stringify(data);
    const buffer = new TextEncoder().encode(jsonString);
    const file = new File([buffer], 'data.json', { type: 'application/json' });
    
    return this.uploadFile(file, encrypt);
  }

  async downloadJSON(hash: string, encryptionKey?: string): Promise<any> {
    const data = await this.downloadFile(hash, encryptionKey);
    const jsonString = new TextDecoder().decode(data);
    return JSON.parse(jsonString);
  }

  async pinFile(hash: string): Promise<void> {
    await this.initialize();

    try {
      await this.ipfs.pin.add(hash);
    } catch (error) {
      console.error('IPFS pin error:', error);
      throw new Error('Failed to pin file');
    }
  }

  async unpinFile(hash: string): Promise<void> {
    await this.initialize();

    try {
      await this.ipfs.pin.rm(hash);
    } catch (error) {
      console.error('IPFS unpin error:', error);
      throw new Error('Failed to unpin file');
    }
  }

  async getFileInfo(hash: string): Promise<{
    hash: string;
    size: number;
    type: string;
  } | null> {
    await this.initialize();

    try {
      const stats = await this.ipfs.files.stat(`/ipfs/${hash}`);
      return {
        hash,
        size: stats.size,
        type: stats.type,
      };
    } catch (error) {
      console.error('IPFS file info error:', error);
      return null;
    }
  }

  private generateEncryptionKey(): string {
    if (typeof window !== 'undefined') {
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    } else {
      return require('crypto').randomBytes(32).toString('hex');
    }
  }

  private async encryptData(data: Uint8Array, key: string): Promise<Uint8Array> {
    if (typeof window !== 'undefined') {
      const cryptoKey = await this.importKey(key);
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        data
      );
      
      const result = new Uint8Array(iv.length + encrypted.byteLength);
      result.set(iv);
      result.set(new Uint8Array(encrypted), iv.length);
      return result;
    } else {
      const crypto = require('crypto');
      const iv = crypto.randomBytes(12);
      const cipher = crypto.createCipher('aes-256-gcm', Buffer.from(key, 'hex'));
      cipher.setAAD(Buffer.from('healthchain'));
      
      const encrypted = Buffer.concat([
        cipher.update(Buffer.from(data)),
        cipher.final(),
      ]);
      
      const tag = cipher.getAuthTag();
      return new Uint8Array(Buffer.concat([iv, tag, encrypted]));
    }
  }

  private async decryptData(encryptedData: Uint8Array, key: string): Promise<Uint8Array> {
    if (typeof window !== 'undefined') {
      const cryptoKey = await this.importKey(key);
      const iv = encryptedData.slice(0, 12);
      const data = encryptedData.slice(12);
      
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        data
      );
      
      return new Uint8Array(decrypted);
    } else {
      const crypto = require('crypto');
      const iv = encryptedData.slice(0, 12);
      const tag = encryptedData.slice(12, 28);
      const data = encryptedData.slice(28);
      
      const decipher = crypto.createDecipher('aes-256-gcm', Buffer.from(key, 'hex'));
      decipher.setAuthTag(Buffer.from(tag));
      decipher.setAAD(Buffer.from('healthchain'));
      
      const decrypted = Buffer.concat([
        decipher.update(Buffer.from(data)),
        decipher.final(),
      ]);
      
      return new Uint8Array(decrypted);
    }
  }

  private async importKey(keyHex: string): Promise<CryptoKey> {
    const keyBuffer = new Uint8Array(keyHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    return await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
  }
}

let ipfsService: IPFSService | null = null;

export function getIPFSService(): IPFSService {
  if (!ipfsService) {
    const config: IPFSConfig = {
      url: process.env.NEXT_PUBLIC_IPFS_URL || 'https://ipfs.infura.io:5001/api/v0',
      projectId: process.env.INFURA_PROJECT_ID,
      projectSecret: process.env.INFURA_PROJECT_SECRET,
    };
    
    ipfsService = new IPFSService(config);
  }
  
  return ipfsService;
}