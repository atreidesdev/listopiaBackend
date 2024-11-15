export type UpdatePublisherType = {
  id: number;
  name?: string;
  description?: string;
  logo?: Express.Multer.File;
};

export type UpdatePublisherTypeWithoutId = Omit<UpdatePublisherType, 'id'>;
