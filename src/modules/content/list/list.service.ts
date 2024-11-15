
import { Injectable } from '@nestjs/common';
import { GenreType, ListItemStatus } from '@prisma/client';
import {
  baseListItemType,
  ListBookMaxPagesType,
  ListItemCurrentType,
  ListItemNoteType,
  ListItemRatingType,
  ListItemReviewType, ListItemType
} from "./types/listItem.type";
import {PrismaService} from "../../../../prisma/prisma.service";

@Injectable()
export class ListService {
  constructor(private readonly prisma: PrismaService) {}

  async updateNote(data: ListItemNoteType) {
    const { userId, genreType, contentId, note } = data;

    const where = this.getWhereClause(genreType, userId, contentId);
    const updateData = { note };

    return this.prisma[this.getModelName(genreType)].update({
      where,
      data: updateData,
    });
  }

  async updateRating(data: ListItemRatingType) {
    const { userId, genreType, contentId, rating } = data;

    const where = this.getWhereClause(genreType, userId, contentId);
    const updateData = { rating };

    return this.prisma[this.getRatingModelName(genreType)].upsert({
      where,
      create: { userId, contentId, rating },
      update: updateData,
    });
  }

  async updateReview(data: ListItemReviewType) {
    const { userId, genreType, contentId, review } = data;

    const where = this.getWhereClause(genreType, userId, contentId);
    const updateData = { review };

    return this.prisma[this.getReviewModelName(genreType)].upsert({
      where,
      create: { userId, contentId, review },
      update: updateData,
    });
  }

  async updateCurrent(data: ListItemCurrentType) {
    const { userId, genreType, contentId, current } = data;

    const where = this.getWhereClause(genreType, userId, contentId);
    const updateData = { current };

    if (genreType === GenreType.book) {
      const bookItem = await this.prisma[
        this.getModelName(genreType)
      ].findUnique({
        where,
      });
      if (bookItem && current === bookItem.maxPages) {
        updateData['status'] = ListItemStatus.watched;
      }
    } else if (genreType === GenreType.movie) {
      const movie = await this.prisma.movie.findUnique({
        where: { id: contentId },
      });
      if (movie && current === movie.seriesCount) {
        updateData['status'] = ListItemStatus.watched;
      }
    }

    return await this.prisma[this.getModelName(genreType)].update({
      where,
      data: updateData,
    });
  }

  async updateMaxPages(data: ListBookMaxPagesType) {
    const { userId, genreType, contentId, maxPages } = data;

    if (genreType != GenreType.book) {
      throw new Error('This method can be used only for Book');
    }

    if (maxPages < 1) {
      throw new Error('Max value should be greater than 1');
    }

    const where = { userId_bookId: { userId, bookId: contentId } };
    const updateData = { maxPages };

    return this.prisma.bookListItem.update({
      where,
      data: updateData,
    });
  }

  async addOrUpdateListItem(data: ListItemType) {
    const { userId, genreType, contentId, status } = data;

    const where = this.getWhereClause(genreType, userId, contentId);
    const updateData = { status };

    console.log(where);

    const createData: any = {
      user: { connect: { id: userId } },
      status,
    };

    switch (genreType) {
      case GenreType.book:
        createData.book = { connect: { id: contentId } };
        break;
      case GenreType.movie:
        createData.movie = { connect: { id: contentId } };
        break;
      case GenreType.game:
        createData.game = { connect: { id: contentId } };
        break;
      default:
        throw new Error(`Unknown genre type: ${genreType}`);
    }

    return this.prisma[this.getModelName(genreType)].upsert({
      where,
      create: createData,
      update: updateData,
    });
  }

  async deleteListItem(data: baseListItemType) {
    const { userId, genreType, contentId } = data;

    const where = this.getWhereClause(genreType, userId, contentId);

    return this.prisma[this.getModelName(genreType)].delete({
      where,
    });
  }

  async getAllListItemsByUser(userId: number) {
    const bookItems = await this.prisma.bookListItem.findMany({
      where: { userId },
    });
    const gameItems = await this.prisma.gameListItem.findMany({
      where: { userId },
    });
    const movieItems = await this.prisma.movieListItem.findMany({
      where: { userId },
    });
    return { bookItems, gameItems, movieItems };
  }

  async getListItemsByTypeAndStatus(data: Omit<ListItemType, 'contentId'>) {
    const { userId, genreType, status } = data;
    const where = { userId, status };
    return this.prisma[this.getModelName(genreType)].findMany({ where });
  }

  private getModelName(genreType: GenreType): string {
    switch (genreType) {
      case 'book':
        return 'bookListItem';
      case 'game':
        return 'gameListItem';
      case 'movie':
        return 'movieListItem';
      default:
        throw new Error(`Unknown content type: ${genreType}`);
    }
  }

  private getWhereClause(
    genreType: GenreType,
    userId: number,
    contentId: number,
  ) {
    switch (genreType) {
      case 'book':
        return { userId_bookId: { userId, bookId: contentId } };
      case 'game':
        return { userId_gameId: { userId, gameId: contentId } };
      case 'movie':
        return { userId_movieId: { userId, movieId: contentId } };
      default:
        throw new Error(`Unknown content type: ${genreType}`);
    }
  }

  private getRatingModelName(genreType: GenreType): string {
    switch (genreType) {
      case 'book':
        return 'bookListItemRating';
      case 'game':
        return 'gameListItemRating';
      case 'movie':
        return 'movieListItemRating';
      default:
        throw new Error(`Unknown content type: ${genreType}`);
    }
  }

  private getReviewModelName(genreType: GenreType): string {
    switch (genreType) {
      case 'book':
        return 'bookListItemReview';
      case 'game':
        return 'gameListItemReview';
      case 'movie':
        return 'movieListItemReview';
      default:
        throw new Error(`Unknown content type: ${genreType}`);
    }
  }
}
