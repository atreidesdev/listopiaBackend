import {
  Book,
  Collection,
  CollectionVisibility,
  Game,
  GenreType,
  Movie,
} from '@prisma/client';

export type CollectionWithItemsType = Collection & {
  books: Pick<Book, 'posterPath' | 'title'>[];
  movies: Pick<Movie, 'posterPath' | 'title'>[];
  games: Pick<Game, 'posterPath' | 'title'>[];
};

export type CollectionItem = {
  userId: number;
  collectionId: number;
  genreType: GenreType;
  contentId: number;
};

export type CollectionType = {
  userId: number;
  name: string;
  description?: string;
  poster?: Express.Multer.File;
};

export type CollectionUpdateType = {
  collectionId: number;
  userId: number;
  name?: string;
  description?: string;
  poster?: Express.Multer.File;
  visibility: CollectionVisibility;
};
