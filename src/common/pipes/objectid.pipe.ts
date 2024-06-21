import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ObjectId } from 'mongodb';

@Injectable()
export class IsObjectIdPipe implements PipeTransform<string> {
  transform(value: string): string {
    if (!ObjectId.isValid(value)) {
      throw new BadRequestException(`Invalid ObjectID: ${value}`);
    }
    return value;
  }
}
