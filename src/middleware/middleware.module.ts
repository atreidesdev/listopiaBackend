import { Module } from '@nestjs/common';
import { LoggingModule } from './logging/logging.module';
// import { SecurityModule } from './security/security.module';
import { VisitTrackingModule } from './visit-tracking/visit-tracking.module';

@Module({
  imports: [VisitTrackingModule, LoggingModule],
})
export class MiddlewareModule {}
