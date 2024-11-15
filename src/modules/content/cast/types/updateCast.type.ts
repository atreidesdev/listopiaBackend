import { GenreType, RoleType } from '@prisma/client';

export type UpdateCastType = {
  id: number;
  roleName?: string;
  roleActor?: string;
  rolePhoto?: Express.Multer.File;
  roleType?: RoleType;
  genreType: GenreType;
  contentId: number;
  characterId?: number;
  actorId?: number;
};

export type UpdateCastDataWithoutId = Omit<UpdateCastType, 'id'>;
