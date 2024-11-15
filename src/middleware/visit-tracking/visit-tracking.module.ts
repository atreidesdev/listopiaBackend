import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { VisitTrackingMiddleware } from './visit-tracking.middleware';
import {PrismaService} from "../../../prisma/prisma.service";

@Module({
  providers: [PrismaService],
})
export class VisitTrackingModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(VisitTrackingMiddleware)
      .forRoutes(
        { path: 'book/:id', method: RequestMethod.GET },
        { path: 'movie/:id', method: RequestMethod.GET },
        { path: 'game/:id', method: RequestMethod.GET },
        { path: 'character/:id', method: RequestMethod.GET },
        { path: 'person/:id', method: RequestMethod.GET },
        { path: 'publisher/:id', method: RequestMethod.GET },
        { path: 'studio/:id', method: RequestMethod.GET },
        { path: 'platform/:id', method: RequestMethod.GET },
        { path: 'franchise/:id', method: RequestMethod.GET },
        { path: 'collection/:id', method: RequestMethod.GET },
        { path: 'developer/:id', method: RequestMethod.GET },
      );
  }
}
