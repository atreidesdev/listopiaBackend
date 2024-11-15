import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import {
  BookListItemRating,
  GameListItemRating,
  GenreType,
  MovieListItemRating,
} from '@prisma/client';
import {PrismaService} from "../../../prisma/prisma.service";

type ListItemRating =
  | BookListItemRating
  | MovieListItemRating
  | GameListItemRating;
type RatingModel =
  | 'bookListItemRating'
  | 'movieListItemRating'
  | 'gameListItemRating';
type ItemModel = 'book' | 'movie' | 'game';

@Injectable()
export class AverageRatingService {
  constructor(private readonly prisma: PrismaService) {}

  @Cron('0 0 * * 6')
  async updateBooksRatings() {
    await this.updateRatingsForListItems(GenreType.book);
  }

  @Cron('0 0 * * 5')
  async updateMovieRatings() {
    await this.updateRatingsForListItems(GenreType.movie);
  }

  @Cron('0 0 * * 4')
  async updateGameRatings() {
    await this.updateRatingsForListItems(GenreType.game);
  }

  async runManualUpdate(genreType: GenreType) {
    if (genreType === GenreType.book) {
      await this.updateBooksRatings();
    } else if (genreType === GenreType.movie) {
      await this.updateMovieRatings();
    } else if (genreType === GenreType.game) {
      await this.updateGameRatings();
    }
  }

  private async updateRatingsForListItems(genreType: GenreType) {
    const listItemModel = this.getRatingModel(genreType);
    const itemModel = this.getItemModel(genreType);
    const itemIdField = this.getItemIdField(genreType);

    const listItems = await this.findListItemRatings(listItemModel);

    const ratingMap = new Map<number, { totalRating: number; count: number }>();

    for (const item of listItems) {
      const id = item[itemIdField];
      const rating = item.rating || 0;

      if (!ratingMap.has(id)) {
        ratingMap.set(id, { totalRating: 0, count: 0 });
      }

      const entry = ratingMap.get(id);
      entry.totalRating += rating;
      entry.count += 1;
      ratingMap.set(id, entry);
    }

    for (const [id, { totalRating, count }] of ratingMap.entries()) {
      const averageRating = parseFloat((totalRating / count).toFixed(2));
      await this.updateItemModel(itemModel, id, averageRating);
    }
  }

  private async findListItemRatings(
    model: RatingModel,
  ): Promise<ListItemRating[]> {
    switch (model) {
      case 'bookListItemRating':
        return this.prisma.bookListItemRating.findMany({
          where: { rating: { not: null } },
        });
      case 'movieListItemRating':
        return this.prisma.movieListItemRating.findMany({
          where: { rating: { not: null } },
        });
      case 'gameListItemRating':
        return this.prisma.gameListItemRating.findMany({
          where: { rating: { not: null } },
        });
      default:
        throw new Error(`Unknown rating model: ${model}`);
    }
  }

  private async updateItemModel(model: ItemModel, id: number, rating: number) {
    switch (model) {
      case 'book':
        await this.prisma.book.update({
          where: { id },
          data: { rating },
        });
        break;
      case 'movie':
        await this.prisma.movie.update({
          where: { id },
          data: { rating },
        });
        break;
      case 'game':
        await this.prisma.game.update({
          where: { id },
          data: { rating },
        });
        break;
      default:
        throw new Error(`Unknown item model: ${model}`);
    }
  }

  private getRatingModel(genreType: GenreType): RatingModel {
    switch (genreType) {
      case GenreType.book:
        return 'bookListItemRating';
      case GenreType.movie:
        return 'movieListItemRating';
      case GenreType.game:
        return 'gameListItemRating';
      default:
        throw new Error(`Unknown content type: ${genreType}`);
    }
  }

  private getItemModel(genreType: GenreType): ItemModel {
    switch (genreType) {
      case GenreType.book:
        return 'book';
      case GenreType.movie:
        return 'movie';
      case GenreType.game:
        return 'game';
      default:
        throw new Error(`Unknown content type: ${genreType}`);
    }
  }

  private getItemIdField(
    genreType: GenreType,
  ): 'bookId' | 'movieId' | 'gameId' {
    switch (genreType) {
      case GenreType.book:
        return 'bookId';
      case GenreType.movie:
        return 'movieId';
      case GenreType.game:
        return 'gameId';
      default:
        throw new Error(`Unknown content type: ${genreType}`);
    }
  }
}
