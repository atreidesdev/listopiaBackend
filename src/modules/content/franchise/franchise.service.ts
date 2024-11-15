
import { Injectable } from '@nestjs/common';
import {
  BookFranchise,
  Franchise,
  GameFranchise,
  MovieFranchise,
  Prisma,
} from '@prisma/client';
import {PrismaService} from "../../../../prisma/prisma.service";
import {FileUtil} from "../../../common/utils/file.util";
import {GetFranchisesType} from "./types/getFranchises.type";
import {CreateFranchiseType} from "./types/createFranchise.type";
import {UpdateFranchiseType} from "./types/updateFranchise.type";
import {AddToFranchisesType, FranchiseItemType} from "./types/franchiseItem.type";

@Injectable()
export class FranchiseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileUtil: FileUtil,
  ) {}

  async getValidFranchises(franchiseIds: number[]): Promise<number[]> {
    const franchises = await this.prisma.franchise.findMany({
      where: {
        id: { in: franchiseIds },
      },
    });

    const validFranchiseIds = new Set(franchises.map((fr) => fr.id));
    return Array.from(validFranchiseIds);
  }

  async getFranchise(id: number): Promise<Franchise> {
    const existingFranchise = await this.prisma.franchise.findUnique({
      where: { id: id },
    });

    if (!existingFranchise) {
      throw new Error('Franchise not found');
    }

    return this.prisma.franchise.findUnique({ where: { id } });
  }

  async getFranchises(
    getFranchisesData: GetFranchisesType,
  ): Promise<Franchise[]> {
    const { page, pageSize, sortField, sortOrder } = getFranchisesData;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    let orderBy: Prisma.FranchiseOrderByWithRelationInput = {
      visitCount: 'desc',
    };

    if (sortField && sortOrder) {
      orderBy = { [sortField]: sortOrder };
    }

    return this.prisma.franchise.findMany({
      skip,
      take,
      orderBy,
    });
  }

  async createFranchise(
    createFranchiseData: CreateFranchiseType,
  ): Promise<Franchise> {
    const { name, description, logo } = createFranchiseData;

    let logoPath = '';
    if (logo) {
      logoPath = await this.fileUtil.saveFile({
        file: logo,
        filename: `${name}_${Date.now()}`,
        folder: 'franchises_logos',
      });
    }

    return this.prisma.franchise.create({
      data: {
        name: name,
        description: description,
        logoPath: logoPath,
      },
    });
  }

  async updateFranchise(
    updateFranchiseData: UpdateFranchiseType,
  ): Promise<Franchise> {
    const { id, name, description, logo } = updateFranchiseData;

    const existingFranchise = await this.prisma.franchise.findUnique({
      where: { id: id },
    });

    if (!existingFranchise) {
      throw new Error('Franchise not found');
    }

    let logoPath = existingFranchise.logoPath;
    if (logo) {
      if (logoPath) {
        logoPath = await this.fileUtil.updateFile(
          logo,
          logoPath,
          `${name}_${Date.now()}`,
          'franchises_logos',
        );
      } else {
        logoPath = await this.fileUtil.saveFile({
          file: logo,
          filename: `${name}_${Date.now()}`,
          folder: 'franchises_logos',
        });
      }
    }

    return this.prisma.franchise.update({
      where: { id },
      data: {
        name: name ?? existingFranchise.name,
        description: description ?? existingFranchise.description,
        logoPath: logoPath ?? existingFranchise.logoPath,
      },
    });
  }

  async deleteFranchise(id: number): Promise<Franchise> {
    const existingFranchise = await this.prisma.franchise.findUnique({
      where: { id: id },
    });

    if (!existingFranchise) {
      throw new Error('Franchise not found');
    }

    if (existingFranchise.logoPath) {
      await this.fileUtil.deleteFile(existingFranchise.logoPath);
    }

    return this.prisma.franchise.delete({ where: { id: id } });
  }

  async addToFranchise(
    FranchiseItemData: Omit<FranchiseItemType, 'id'>,
  ): Promise<BookFranchise | MovieFranchise | GameFranchise> {
    const { franchiseId, genreType, contentId } = FranchiseItemData;

    const existingFranchise = await this.prisma.franchise.findUnique({
      where: { id: franchiseId },
    });

    if (!existingFranchise) {
      throw new Error('Franchise not found');
    }

    switch (genreType) {
      case 'book':
        const book = await this.prisma.book.findUnique({
          where: { id: contentId },
        });
        if (book) {
          return this.prisma.bookFranchise.create({
            data: {
              franchiseId: franchiseId,
              bookId: contentId,
            },
          });
        } else {
          throw new Error(`Book with ID ${contentId} not found`);
        }

      case 'movie':
        const movie = await this.prisma.movie.findUnique({
          where: { id: contentId },
        });
        if (movie) {
          return this.prisma.movieFranchise.create({
            data: {
              franchiseId: franchiseId,
              movieId: contentId,
            },
          });
        } else {
          throw new Error(`Movie with ID ${contentId} not found`);
        }

      case 'game':
        const game = await this.prisma.game.findUnique({
          where: { id: contentId },
        });
        if (game) {
          return this.prisma.gameFranchise.create({
            data: {
              franchiseId: franchiseId,
              gameId: contentId,
            },
          });
        } else {
          throw new Error(`Game with ID ${contentId} not found`);
        }

      default:
        throw new Error('Invalid content type');
    }
  }

  async addToFranchises(
    addToFranchisesData: AddToFranchisesType,
  ): Promise<void> {
    const { franchiseIds, genreType, contentId } = addToFranchisesData;

    const validFranchiseIds = await this.getValidFranchises(franchiseIds);

    if (validFranchiseIds.length === 0) {
      throw new Error('No valid franchises found');
    }

    const createRelationPromises = validFranchiseIds.map((franchiseId) => {
      switch (genreType) {
        case 'book':
          return this.prisma.bookFranchise.create({
            data: {
              franchiseId: franchiseId,
              bookId: contentId,
            },
          });
        case 'movie':
          return this.prisma.movieFranchise.create({
            data: {
              franchiseId: franchiseId,
              movieId: contentId,
            },
          });
        case 'game':
          return this.prisma.gameFranchise.create({
            data: {
              franchiseId: franchiseId,
              gameId: contentId,
            },
          });
        default:
          throw new Error('Invalid content type');
      }
    });

    await Promise.all(createRelationPromises);
  }

  async deleteFromFranchise(
    deleteFromFranchiseData: FranchiseItemType,
  ): Promise<BookFranchise | MovieFranchise | GameFranchise> {
    const { franchiseId, genreType, contentId } = deleteFromFranchiseData;

    switch (genreType) {
      case 'book':
        return this.prisma.bookFranchise.delete({
          where: {
            franchiseId_bookId: {
              franchiseId: franchiseId,
              bookId: contentId,
            },
          },
        });
      case 'movie':
        return this.prisma.movieFranchise.delete({
          where: {
            franchiseId_movieId: {
              franchiseId: franchiseId,
              movieId: contentId,
            },
          },
        });
      case 'game':
        return this.prisma.gameFranchise.delete({
          where: {
            franchiseId_gameId: {
              franchiseId: franchiseId,
              gameId: contentId,
            },
          },
        });
      default:
        throw new Error('Invalid content type');
    }
  }

  async deleteContentsFromFranchise(
    deleteContentsFromFranchiseData: FranchiseItemType[],
  ): Promise<void> {
    const deletePromises = deleteContentsFromFranchiseData.map((data) => {
      return this.deleteFromFranchise(data);
    });

    await Promise.all(deletePromises);
  }
}
