
import {Injectable} from '@nestjs/common';
import {Game, GameListItem, Prisma} from '@prisma/client';
import {PrismaService} from "../../../../prisma/prisma.service";
import {FileUtil} from "../../../common/utils/file.util";
import {CastService} from "../cast/cast.service";
import {FranchiseService} from "../franchise/franchise.service";
import {GetGameWithTranslationType} from "./types/getGame.type";
import {GetGamesWithTranslationType} from "./types/getGames.type";
import {CreateGameType} from "./types/createGame.type";
import {UpdateGameType} from "./types/updateGame.type";
import {createUpdateData} from "../../../common/utils/updateData.util";

@Injectable()
export class GameService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileUtil: FileUtil,
    private readonly castService: CastService,
    private readonly franchiseService: FranchiseService,
  ) {}

  async getGame(
    getGameData: GetGameWithTranslationType,
  ): Promise<Game & { gameListItem?: GameListItem }> {
    const { id: id, userId: userId, lang = 'ru' } = getGameData;

    const existingGame = await this.prisma.game.findUnique({
      where: { id },
      include: {
        genres: true,
        themes: true,
        developers: true,
        platforms: true,
        publishers: true,
      },
    });

    if (!existingGame) {
      throw new Error('Game not found');
    }

    const translations = existingGame.translations || {};
    const translatedGame = {
      ...existingGame,
      title:
        lang === 'ru'
          ? existingGame.title
          : translations[lang]?.title || existingGame.title,
      description:
        lang === 'ru'
          ? existingGame.description
          : translations[lang]?.description || existingGame.description,
      translations: lang === 'ru' ? existingGame.translations : undefined,
    };

    if (userId) {
      const gameListItem = await this.prisma.gameListItem.findUnique({
        where: { userId_gameId: { userId, gameId: id } },
      });
      return { ...translatedGame, gameListItem };
    }

    return translatedGame;
  }

  async getGames(getGamesData: GetGamesWithTranslationType): Promise<Game[]> {
    const {
      page,
      pageSize,
      sortField,
      sortOrder,
      genreIds,
      themeIds,
      lang = 'ru',
    } = getGamesData;

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    let orderBy: Prisma.GameOrderByWithRelationInput = {
      visitCount: 'desc',
    };

    if (sortField && sortOrder) {
      orderBy = { [sortField]: sortOrder };
    }

    const games = await this.prisma.game.findMany({
      skip,
      take,
      orderBy,
      where: {
        AND: [
          genreIds ? { genres: { some: { id: { in: genreIds } } } } : undefined,
          themeIds ? { themes: { some: { id: { in: themeIds } } } } : undefined,
        ],
      },
    });

    return games.map((game) => ({
      ...game,
      title:
        lang === 'ru'
          ? game.title
          : (game.translations || {})[lang]?.title || game.title,
      description:
        lang === 'ru'
          ? game.description
          : (game.translations || {})[lang]?.description || game.description,
    }));
  }

  async getAllGames(): Promise<Game[]> {
    return this.prisma.game.findMany({
      include: {
        genres: true,
        themes: true,
        developers: true,
        platforms: true,
        publishers: true,
      },
    });
  }

  async createGame(createGameData: CreateGameType): Promise<Game> {
    const {
      title,
      description,
      poster,
      developers_ids,
      publishers_ids,
      platforms_ids,
      themes_ids,
      release,
      genres_ids,
      franchise_ids,
      cast,
      status,
      ageRating,
      links,
      translations,
    } = createGameData;

    let posterPath = '';
    if (poster) {
      posterPath = await this.fileUtil.saveFile({
        file: poster,
        filename: `${title}_${Date.now()}`,
        folder: 'game_posters',
      });
    }

    const game = await this.prisma.game.create({
      data: {
        title: title,
        description: description,
        posterPath: posterPath,
        release: release,
        status: status,
        ageRating: ageRating,
        links,
        translations,
        developers: {
          connect: developers_ids.map((id) => ({ id })),
        },
        publishers: {
          connect: publishers_ids.map((id) => ({ id })),
        },
        platforms: {
          connect: platforms_ids.map((id) => ({ id })),
        },
        themes: {
          connect: themes_ids.map((id) => ({ id })),
        },
        genres: {
          connect: genres_ids.map((id) => ({ id })),
        },
      },
    });

    await this.franchiseService.addToFranchises({
      franchiseIds: franchise_ids,
      contentId: game.id,
      genreType: 'game',
    });

    if (cast && cast.length > 0) {
      const updatedCast = cast.map((c) => ({ ...c, contentId: game.id }));
      await this.castService.createCastByArray(updatedCast);
    }

    return game;
  }

  async updateGame(updateGameData: UpdateGameType): Promise<Game> {
    const {
      id,
      title,
      description,
      poster,
      developers_ids,
      publishers_ids,
      platforms_ids,
      themes_ids,
      release,
      genres_ids,
      franchise_ids,
      cast,
      status,
      ageRating,
      links,
      translations,
    } = updateGameData;

    const existingGame = await this.prisma.game.findUnique({ where: { id } });
    if (!existingGame) {
      throw new Error('Game not found');
    }

    let posterPath = existingGame.posterPath;
    if (poster) {
      posterPath = await this.fileUtil.updateFile(
        poster,
        existingGame.posterPath,
        `${title}_${Date.now()}`,
        'game_posters',
      );
    }

    const updateData = createUpdateData({
      title,
      description,
      release,
      status,
      ageRating,
      posterPath,
      links,
      translations,
      developers: developers_ids,
      publishers: publishers_ids,
      platforms: platforms_ids,
      themes: themes_ids,
      genres: genres_ids,
      GameFranchise: franchise_ids,
    });

    const game = await this.prisma.game.update({
      where: { id },
      data: updateData,
    });

    if (cast && cast.length > 0) {
      await this.castService.updateCasts(cast);
    }

    return game;
  }

  async deleteGame(id: number): Promise<Game> {
    return this.prisma.game.delete({ where: { id } });
  }
}
