import { Module } from '@nestjs/common';
import { AverageRatingController } from './average-rating.controller';
import { AverageRatingService } from './average-rating.service';

@Module({
  controllers: [AverageRatingController],
  providers: [AverageRatingService],
})
export class AverageRatingModule {}
