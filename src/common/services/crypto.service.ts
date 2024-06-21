import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

@Injectable()
export class CryptoService {
  private readonly encryptionKey: string;

  constructor(configService: ConfigService) {
    this.encryptionKey = configService.get<string>('secrets.forgotPassword');
  }

  async encrypt(data: string): Promise<string> {
    const salt = randomBytes(16);
    const iv = randomBytes(16);
    const key = (await promisify(scrypt)(
      this.encryptionKey,
      salt,
      32,
    )) as Buffer;
    const cipher = createCipheriv('aes-256-ctr', key, iv);
    const encrypted = Buffer.concat([
      cipher.update(data, 'utf8'),
      cipher.final(),
    ]);
    return Buffer.concat([salt, iv, encrypted]).toString('hex');
  }

  async decrypt(encryptedData: string): Promise<string> {
    try {
      const buffer = Buffer.from(encryptedData, 'hex');
      const uint8Array = new Uint8Array(
        buffer.buffer,
        buffer.byteOffset,
        buffer.byteLength,
      );
      const salt = Buffer.from(uint8Array.slice(0, 16));
      const iv = Buffer.from(uint8Array.slice(16, 32));
      const ciphertext = Buffer.from(uint8Array.slice(32));
      const key = (await promisify(scrypt)(
        this.encryptionKey,
        salt,
        32,
      )) as Buffer;
      const decipher = createDecipheriv('aes-256-ctr', key, iv);
      const decrypted = Buffer.concat([
        decipher.update(ciphertext),
        decipher.final(),
      ]);
      return decrypted.toString();
    } catch (error) {
      throw new BadRequestException('Invalid Key');
    }
  }
}
