
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
import { Movie } from '@prisma/client';
import { MovieService } from './movie.service';
import {CurrentUser} from "../../../common/decorators/current-user.decorator";
import {UserPayload} from "../../auth/types/user-payload.type";
import {GetMoviesType} from "./types/getMovies.type";
import {RolesGuard} from "../../../common/guards/RolesGuard/roles.guard";
import {Roles} from "../../../common/decorators/roles.decorator";
import {CreateMovieType} from "./types/createMovie.type";
import {UpdateMovieTypeWithoutId} from "./types/updateMovie.type";

@Controller('movie')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Get(':id')
  async getMovie(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserPayload,
    @Query('lang') lang?: string,
  ): Promise<Movie> {
    return this.movieService.getMovie({ id, userId: user?.id, lang });
  }

  @Get()
  async getMovies(
    @Query() getMoviesData: GetMoviesType,
    @Query('lang') lang?: string,
  ): Promise<Movie[]> {
    if (Object.keys(getMoviesData).length === 0) {
      return this.movieService.getAllMovies();
    }
    return this.movieService.getMovies({ ...getMoviesData, lang });
  }

  @UseGuards(RolesGuard)
  @Roles('admin', 'developer', 'editor')
  @Post()
  async createMovie(@Body() createMovieData: CreateMovieType): Promise<Movie> {
    return this.movieService.createMovie(createMovieData);
  }

  @UseGuards(RolesGuard)
  @Roles('admin', 'developer', 'editor')
  @Put(':id')
  async updateMovie(
    @Body() updateMovieData: UpdateMovieTypeWithoutId,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Movie> {
    return this.movieService.updateMovie({ ...updateMovieData, id: id });
  }

  @UseGuards(RolesGuard)
  @Roles('admin', 'developer', 'editor')
  @Delete(':id')
  async deleteMovie(@Param('id', ParseIntPipe) id: number): Promise<Movie> {
    return this.movieService.deleteMovie(id);
  }
}
