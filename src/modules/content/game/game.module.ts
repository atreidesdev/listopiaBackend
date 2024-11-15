
import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import {CastService} from "../cast/cast.service";
import {FranchiseService} from "../franchise/franchise.service";

@Module({
  controllers: [GameController],
  providers: [GameService, CastService, FranchiseService],
})
export class GameModule {}
