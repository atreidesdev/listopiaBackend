
import { Injectable } from '@nestjs/common';
import { BookCast, GameCast, GenreType, MovieCast } from '@prisma/client';
import {FileUtil} from "../../../common/utils/file.util";
import {PrismaService} from "../../../../prisma/prisma.service";
import {GetCastType} from "./types/getCast.type";
import {CreateCastType} from "./types/createCast.type";
import {UpdateCastType} from "./types/updateCast.type";
import {DeleteCastType} from "./types/deleteCast.type";

@Injectable()
export class CastService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileUtil: FileUtil,
  ) {}

  async getCast(
    getCastData: GetCastType,
  ): Promise<(BookCast | MovieCast | GameCast)[]> {
    const { contentId, genreType } = getCastData;
    const whereCondition: { [key: string]: number } = this.createWhereCondition(
      contentId,
      genreType,
    );

    switch (genreType) {
      case 'book':
        return this.prisma.bookCast.findMany({
          where: whereCondition,
          orderBy: { roleType: 'asc' },
        });
      case 'movie':
        return this.prisma.movieCast.findMany({
          where: whereCondition,
          orderBy: { roleType: 'asc' },
        });
      case 'game':
        return this.prisma.gameCast.findMany({
          where: whereCondition,
          orderBy: { roleType: 'asc' },
        });
      default:
        throw new Error('Invalid content type');
    }
  }

  private createWhereCondition(
    contentId: number,
    genreType: GenreType,
  ): { [key: string]: number } {
    const whereCondition: { [key: string]: number } = {};

    switch (genreType) {
      case 'book':
        whereCondition.bookId = contentId;
        break;
      case 'movie':
        whereCondition.movieId = contentId;
        break;
      case 'game':
        whereCondition.gameId = contentId;
        break;
      default:
        throw new Error('Invalid content type');
    }

    return whereCondition;
  }

  async createCast(
    createCastData: CreateCastType,
  ): Promise<BookCast | MovieCast | GameCast> {
    const {
      contentId,
      genreType,
      roleName,
      roleActor,
      rolePhoto,
      roleType,
      characterId,
      actorId,
    } = createCastData;

    let rolePhotoPath: string | undefined = undefined;
    if (rolePhoto) {
      rolePhotoPath = await this.fileUtil.saveFile({
        file: rolePhoto,
        filename: rolePhoto.originalname,
        folder: 'casts-photos',
      });
    }

    const data: any = {
      roleName,
      roleActor,
      rolePhotoPath: rolePhotoPath,
      roleType,
      characterId,
      actorId,
    };

    switch (genreType) {
      case 'book':
        data.bookId = contentId;
        return this.prisma.bookCast.create({ data });
      case 'movie':
        data.movieId = contentId;
        return this.prisma.movieCast.create({ data });
      case 'game':
        data.gameId = contentId;
        return this.prisma.gameCast.create({ data });
      default:
        throw new Error('Invalid content type');
    }
  }

  async createCastByArray(
    createCastDatas: CreateCastType[],
  ): Promise<(BookCast | MovieCast | GameCast)[]> {
    const casts = [];

    for (const createCastData of createCastDatas) {
      const cast = await this.createCast(createCastData);
      casts.push(cast);
    }

    return casts;
  }

  async updateCast(
    updateCastData: UpdateCastType,
  ): Promise<BookCast | MovieCast | GameCast> {
    const {
      id,
      contentId,
      genreType,
      roleName,
      roleActor,
      rolePhoto,
      roleType,
      characterId,
      actorId,
    } = updateCastData;

    let rolePhotoPath: string | undefined = undefined;
    if (rolePhoto) {
      rolePhotoPath = await this.fileUtil.saveFile({
        file: rolePhoto,
        filename: rolePhoto.originalname,
        folder: 'casts-photos',
      });
    }

    const data: any = {
      roleName,
      roleActor,
      rolePhotoPath: rolePhotoPath,
      roleType,
      characterId,
      actorId,
      contentId,
    };

    switch (genreType) {
      case 'book':
        return this.prisma.bookCast.update({
          where: { id },
          data,
        });
      case 'movie':
        return this.prisma.movieCast.update({
          where: { id },
          data,
        });
      case 'game':
        return this.prisma.gameCast.update({
          where: { id },
          data,
        });
      default:
        throw new Error('Invalid content type');
    }
  }

  async updateCasts(
    updateCastDatas: UpdateCastType[],
  ): Promise<(BookCast | MovieCast | GameCast)[]> {
    const casts = [];

    for (const updateCastData of updateCastDatas) {
      const cast = await this.updateCast(updateCastData);
      casts.push(cast);
    }

    return casts;
  }

  async deleteCast(
    deleteCastData: DeleteCastType,
  ): Promise<BookCast | MovieCast | GameCast> {
    const { id, genreType } = deleteCastData;

    switch (genreType) {
      case 'book':
        return this.prisma.bookCast.delete({
          where: { id },
        });
      case 'movie':
        return this.prisma.movieCast.delete({
          where: { id },
        });
      case 'game':
        return this.prisma.gameCast.delete({
          where: { id },
        });
      default:
        throw new Error('Invalid content type');
    }
  }
}
