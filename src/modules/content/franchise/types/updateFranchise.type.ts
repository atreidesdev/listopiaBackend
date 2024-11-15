export type UpdateFranchiseType = {
  id: number;
  name?: string;
  description?: string;
  logo?: Express.Multer.File;
};

export type UpdateFranchiseTypeWithoutId = Omit<UpdateFranchiseType, 'id'>;
