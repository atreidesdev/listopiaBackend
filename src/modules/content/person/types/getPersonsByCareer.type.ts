import { PersonCareer } from '@prisma/client';

export type GetPersonsByCareerType = {
  career: PersonCareer;
  page: number;
  pageSize: number;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
};
