import { GenreType, RoleType } from '@prisma/client';

export type CreateCastType = {
  roleName?: string;
  roleActor?: string;
  rolePhoto?: Express.Multer.File;
  roleType?: RoleType;
  genreType: GenreType;
  contentId: number;
  characterId?: number;
  actorId?: number;
};

export type CreateCastDataWithoutId = Omit<CreateCastType, 'id'>;
