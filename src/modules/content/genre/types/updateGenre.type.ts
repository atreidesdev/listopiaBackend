import { GenreType } from '@prisma/client';

export type UpdateGenreType = {
  id: number;
  name?: string;
  description?: string;
  genreTypes?: GenreType[];
};

export type UpdateGenreTypeWithoutId = Omit<UpdateGenreType, 'id'>;
