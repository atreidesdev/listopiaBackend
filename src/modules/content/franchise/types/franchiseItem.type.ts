import { GenreType } from '@prisma/client';

export type FranchiseItemType = {
  franchiseId: number;
  genreType: GenreType;
  contentId: number;
};

export type AddToFranchisesType = Omit<FranchiseItemType, 'franchiseId'> & {
  franchiseIds: number[];
};
