export type UpdateDeveloperType = {
  id: number;
  name?: string;
  description?: string;
  logo?: Express.Multer.File;
};

export type UpdateDeveloperTypeWithoutId = Omit<UpdateDeveloperType, 'id'>;
