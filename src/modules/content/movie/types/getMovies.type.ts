export type GetMoviesType = {
  page: number;
  pageSize: number;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  genreIds?: number[];
  themeIds?: number[];
};

export type GetMoviesWithTranslationType = GetMoviesType & {
  lang?: string;
};
