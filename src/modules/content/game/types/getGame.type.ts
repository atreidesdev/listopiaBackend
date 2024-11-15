export type GetGameType = {
  id: number;
  userId?: number;
};

export type GetGameWithTranslationType = GetGameType & {
  lang?: string;
};
