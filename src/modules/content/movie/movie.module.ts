
import { Module } from '@nestjs/common';
import { MovieController } from './movie.controller';
import { MovieService } from './movie.service';
import {FranchiseService} from "../franchise/franchise.service";
import {CastService} from "../cast/cast.service";

@Module({
  controllers: [MovieController],
  providers: [MovieService, CastService, FranchiseService],
})
export class MovieModule {}
