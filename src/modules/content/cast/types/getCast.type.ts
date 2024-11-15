import { GenreType } from '@prisma/client';

export type GetCastType = {
  genreType: GenreType;
  contentId: number;
};
