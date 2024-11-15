import { GenreType } from '@prisma/client';

export type CreateGenreType = {
  name: string;
  description?: string;
  genreTypes: GenreType[];
};
