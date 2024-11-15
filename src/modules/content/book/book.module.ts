
import { Module } from '@nestjs/common';
import { BookController } from './book.controller';
import { BookService } from './book.service';
import {CastService} from "../cast/cast.service";
import {FranchiseService} from "../franchise/franchise.service";

@Module({
  controllers: [BookController],
  providers: [BookService, CastService, FranchiseService],
})
export class BookModule {}
