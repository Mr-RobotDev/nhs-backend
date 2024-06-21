import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import {
  ALLOWED_IMAGE_TYPES,
  IMAGE_MAX_SIZE,
} from '../constants/image.constant';

@Injectable()
export class ImageUploadPipe implements PipeTransform {
  transform(file: Express.Multer.File) {
    if (
      !file ||
      file.size > IMAGE_MAX_SIZE ||
      !ALLOWED_IMAGE_TYPES.includes(file.mimetype)
    ) {
      throw new BadRequestException('Invalid File Type / Size');
    }
    return file;
  }
}
