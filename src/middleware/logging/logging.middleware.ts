import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggingMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    console.log('Request Body:', req.body);
    console.log('Request Headers:', req.headers);
    console.log('Query Parameters:', req.query);

    res.on('error', (err) => {
      this.logger.error(`Error occurred: ${err.message}`, err.stack);
    });

    res.on('finish', () => {
      const { method, url } = req;
      const { statusCode } = res;
      this.logger.log(`${method} ${url} ${statusCode}`);
    });

    next();
  }
}
