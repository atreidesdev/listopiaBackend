import { PersonCareer } from '@prisma/client';

export type CreatePersonType = {
  name: string;
  description?: string;
  photo?: Express.Multer.File;
  birthday?: Date;
  career: PersonCareer[];
};
