export type UpdateStudioType = {
  id: number;
  name?: string;
  description?: string;
  logo?: Express.Multer.File;
};

export type UpdateStudioTypeWithoutId = Omit<UpdateStudioType, 'id'>;
