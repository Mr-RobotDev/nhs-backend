import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('REQUEST LOG');
  use(req: Request, res: Response, next: NextFunction): void {
    const startTime = new Date();
    const { ip, method, originalUrl } = req;

    res.on('finish', () => {
      const endTime = new Date();
      const responseTime = endTime.getTime() - startTime.getTime();
      this.logger.log(
        `[${startTime.toLocaleString()}] - ${ip} - ${method} ${originalUrl} - ${
          res.statusCode
        } - ${responseTime}ms`,
      );
    });

    next();
  }
}
