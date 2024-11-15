import { MiddlewareConsumer, Module } from '@nestjs/common';
import { RateLimitMiddleware } from './rate-limit.middleware';
import {PrismaService} from "../../../../prisma/prisma.service";

@Module({
  providers: [PrismaService],
})
export class RateLimitModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RateLimitMiddleware).forRoutes('auth/login');
  }
}
