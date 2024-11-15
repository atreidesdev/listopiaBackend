import { Module } from '@nestjs/common';
import { RateLimitModule } from './rate-limit/rate-limit.module';

@Module({
  imports: [RateLimitModule],
})
export class SecurityModule {}
