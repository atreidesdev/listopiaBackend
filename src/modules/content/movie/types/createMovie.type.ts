import { AgeRating, MovieStatus, MovieType } from '@prisma/client';
import {CreateCastDataWithoutId} from "../../cast/types/createCast.type";

export type MovieTranslationType = {
  title: string;
  description?: string;
};

export type CreateMovieType = {
  title: string;
  description?: string;
  movieType?: MovieType;
  directors_ids?: number[];
  studios_ids?: number[];
  poster?: Express.Multer.File;
  release?: Date;
  ageRating?: AgeRating;
  status?: MovieStatus;
  duration?: number;
  isSeries?: boolean;
  seriesCount?: number;
  genres_ids?: number[];
  themes_ids?: number[];
  franchise_ids?: number[];
  cast?: CreateCastDataWithoutId[];
  links?: Record<string, string>;
  translations?: Record<string, MovieTranslationType>;
};
