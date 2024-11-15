export type UpdatePlatformType = {
  id: number;
  name?: string;
  description?: string;
  logo?: Express.Multer.File;
};

export type UpdatePlatformTypeWithoutId = Omit<UpdatePlatformType, 'id'>;
