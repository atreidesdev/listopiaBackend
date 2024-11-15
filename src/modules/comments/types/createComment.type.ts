import { ContentType } from '@prisma/client';

export type CreateCommentType = {
  userId: number;
  text: string;
  parentId?: number;
  contentType: ContentType;
  contentId: number;
};

export type CreateCommentTypeWithoutId = Omit<CreateCommentType, 'userId'>;
