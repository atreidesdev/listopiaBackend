import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { GenreType } from '@prisma/client';
import { GenreService } from './genre.service';
import {RolesGuard} from "../../../common/guards/RolesGuard/roles.guard";
import {Roles} from "../../../common/decorators/roles.decorator";
import {CreateGenreType} from "./types/createGenre.type";
import {UpdateGenreTypeWithoutId} from "./types/updateGenre.type";

@Controller('genre')
export class GenreController {
  constructor(private readonly genreService: GenreService) {}

  @UseGuards(RolesGuard)
  @Roles('admin', 'developer', 'editor')
  @Post()
  async createGenre(@Body() createGenreData: CreateGenreType) {
    return this.genreService.createGenre(createGenreData);
  }

  @UseGuards(RolesGuard)
  @Roles('admin', 'developer', 'editor')
  @Put(':id')
  async updateGenre(
    @Body() updateGenreData: UpdateGenreTypeWithoutId,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.genreService.updateGenre({ ...updateGenreData, id: id });
  }

  @UseGuards(RolesGuard)
  @Roles('admin', 'developer', 'editor')
  @Delete(':id')
  async deleteGenre(@Param('id', ParseIntPipe) id: number) {
    return this.genreService.deleteGenre(id);
  }

  @Get()
  async getAllGenres() {
    return this.genreService.getAllGenres();
  }

  @Get(':genreType')
  async getGenresByType(@Param('genreType') genreType: GenreType) {
    return this.genreService.getGenresByType(genreType);
  }
}
