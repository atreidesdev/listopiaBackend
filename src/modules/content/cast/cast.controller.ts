
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BookCast, GameCast, GenreType, MovieCast } from '@prisma/client';
import { CastService } from './cast.service';
import {GetCastType} from "./types/getCast.type";
import {RolesGuard} from "../../../common/guards/RolesGuard/roles.guard";
import {Roles} from "../../../common/decorators/roles.decorator";
import {CreateCastType} from "./types/createCast.type";
import {UpdateCastDataWithoutId, UpdateCastType} from "./types/updateCast.type";

@Controller('casts')
export class CastController {
  constructor(private readonly castService: CastService) {}

  @Get()
  async getCast(
    @Query() getCastData: GetCastType,
  ): Promise<(BookCast | MovieCast | GameCast)[]> {
    return this.castService.getCast(getCastData);
  }

  @UseGuards(RolesGuard)
  @Roles('admin', 'developer', 'editor')
  @Post()
  async createCast(
    @Body() createCastData: CreateCastType,
  ): Promise<BookCast | MovieCast | GameCast> {
    return this.castService.createCast(createCastData);
  }

  @UseGuards(RolesGuard)
  @Roles('admin', 'developer', 'editor')
  @Post('array')
  async createCastByArray(
    @Body() createCastDatas: CreateCastType[],
  ): Promise<(BookCast | MovieCast | GameCast)[]> {
    return this.castService.createCastByArray(createCastDatas);
  }

  @UseGuards(RolesGuard)
  @Roles('admin', 'developer', 'editor')
  @Put(':id')
  async updateCast(
    @Body() updateCastData: UpdateCastDataWithoutId,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<BookCast | MovieCast | GameCast> {
    return this.castService.updateCast({ ...updateCastData, id: id });
  }

  @UseGuards(RolesGuard)
  @Roles('admin', 'developer', 'editor')
  @Put('array')
  async updateCasts(
    @Body() updateCastsData: UpdateCastType[],
  ): Promise<(BookCast | MovieCast | GameCast)[]> {
    return this.castService.updateCasts(updateCastsData);
  }

  @UseGuards(RolesGuard)
  @Roles('admin', 'developer', 'editor')
  @Delete(':genreType/:id')
  async deleteCast(
    @Param('id', ParseIntPipe) id: number,
    @Param('genreType') genreType: GenreType,
  ): Promise<BookCast | MovieCast | GameCast> {
    return this.castService.deleteCast({ id: id, genreType: genreType });
  }
}
