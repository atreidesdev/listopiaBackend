
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
import { Game } from '@prisma/client';
import { GameService } from './game.service';
import {CurrentUser} from "../../../common/decorators/current-user.decorator";
import {UserPayload} from "../../auth/types/user-payload.type";
import {GetGamesType} from "./types/getGames.type";
import {RolesGuard} from "../../../common/guards/RolesGuard/roles.guard";
import {Roles} from "../../../common/decorators/roles.decorator";
import {CreateGameType} from "./types/createGame.type";
import {UpdateGameTypeWithoutId} from "./types/updateGame.type";

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get(':id')
  async getGame(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserPayload,
    @Query('lang') lang?: string,
  ): Promise<Game> {
    return this.gameService.getGame({ id, userId: user?.id, lang });
  }

  @Get()
  async getGames(
    @Query() getGamesData: GetGamesType,
    @Query('lang') lang?: string,
  ): Promise<Game[]> {
    if (Object.keys(getGamesData).length === 0) {
      return this.gameService.getAllGames();
    }
    return this.gameService.getGames({ ...getGamesData, lang });
  }

  @UseGuards(RolesGuard)
  @Roles('admin', 'developer', 'editor')
  @Post()
  async createGame(@Body() createGameData: CreateGameType): Promise<Game> {
    return this.gameService.createGame(createGameData);
  }

  @UseGuards(RolesGuard)
  @Roles('admin', 'developer', 'editor')
  @Put(':id')
  async updateGame(
    @Body() updateGameData: UpdateGameTypeWithoutId,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Game> {
    return this.gameService.updateGame({ ...updateGameData, id: id });
  }

  @UseGuards(RolesGuard)
  @Roles('admin', 'developer', 'editor')
  @Delete(':id')
  async deleteGame(@Param('id', ParseIntPipe) id: number): Promise<Game> {
    return this.gameService.deleteGame(id);
  }
}
