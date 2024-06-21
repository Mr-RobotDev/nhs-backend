import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3, PutObjectCommand, ObjectCannedACL } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

@Injectable()
export class MediaService {
  private s3: S3;

  constructor(private configService: ConfigService) {
    this.s3 = new S3({
      endpoint: configService.get('spaces.endpoint'),
      region: configService.get('spaces.region'),
      credentials: {
        accessKeyId: configService.get('spaces.accessKey'),
        secretAccessKey: configService.get('spaces.secretKey'),
      },
    });
  }

  async uploadFile(
    fileBuffer: Buffer,
    originalname: string,
    folder: string,
    mimetype?: string,
    user?: string,
  ): Promise<string> {
    try {
      const extension = path.parse(originalname).ext;
      const key = user
        ? `${user}/${folder}/${uuidv4()}${extension}`
        : `${folder}/${originalname}`;

      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.configService.get('spaces.bucket'),
          Key: key,
          Body: fileBuffer,
          ACL: ObjectCannedACL.public_read,
          ...(mimetype && { ContentType: mimetype }),
        }),
      );
      return `${this.configService.get('spaces.cdn')}/${key}`;
    } catch (error) {
      throw new InternalServerErrorException('File upload failed');
    }
  }
}
