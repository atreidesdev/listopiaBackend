export type GetMovieType = {
  id: number;
  userId?: number;
};

export type GetMovieWithTranslationType = GetMovieType & {
  lang?: string;
};
