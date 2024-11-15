import { GenreType } from '@prisma/client';

export type DeleteCastType = {
  id: number;
  genreType: GenreType;
};
