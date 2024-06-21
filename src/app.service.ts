import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return '🚀 NHS (v1.0.0) is running! 🚀';
  }
}
