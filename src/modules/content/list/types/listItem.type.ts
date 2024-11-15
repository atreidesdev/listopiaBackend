import { GenreType, ListItemStatus } from '@prisma/client';

export type baseListItemType = {
  userId: number;
  genreType: GenreType;
  contentId: number;
};

export type ListItemNoteType = baseListItemType & {
  note: string | null;
};

export type ListItemRatingType = baseListItemType & {
  rating: number | null;
};

export type ListItemReviewType = baseListItemType & {
  review: string | null;
};

export type ListItemCurrentType = baseListItemType & {
  current: number | null;
};

export type ListItemType = baseListItemType & {
  status: ListItemStatus;
};

export type ListBookMaxPagesType = baseListItemType & {
  maxPages: number;
};
