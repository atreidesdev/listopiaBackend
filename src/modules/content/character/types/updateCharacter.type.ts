export type UpdateCharacterType = {
  id: number;
  name?: string;
  description?: string;
  photo?: Express.Multer.File;
};

export type UpdateCharacterTypeWithoutId = Omit<UpdateCharacterType, 'id'>;
