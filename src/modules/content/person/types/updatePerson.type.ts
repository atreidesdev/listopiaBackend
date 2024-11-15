import { PersonCareer } from '@prisma/client';

export type UpdatePersonType = {
  id: number;
  name?: string;
  description?: string;
  photo?: Express.Multer.File;
  birthday?: Date;
  career?: PersonCareer[];
};

export type UpdatePersonTypeWithoutId = Omit<UpdatePersonType, 'id'>;
