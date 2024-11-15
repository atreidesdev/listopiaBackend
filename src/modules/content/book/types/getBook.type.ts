export type GetBookType = {
  id: number;
  userId?: number;
  lang?: string;
};

export type GetBookWithTranslationType = GetBookType & {
  lang?: string;
};
