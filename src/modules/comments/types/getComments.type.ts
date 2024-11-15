import { ContentType } from '@prisma/client';

export type GetCommentsType = {
  contentType: ContentType;
  contentId: number;
  page: number;
};
