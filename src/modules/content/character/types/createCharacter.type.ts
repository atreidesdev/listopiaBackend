export type CreateCharacterType = {
  name: string;
  description?: string;
  photo?: Express.Multer.File;
};
