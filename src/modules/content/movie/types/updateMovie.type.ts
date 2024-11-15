
import { AgeRating, MovieStatus, MovieType } from '@prisma/client';
import {UpdateCastType} from "../../cast/types/updateCast.type";
import {MovieTranslationType} from "./createMovie.type";

export type UpdateMovieType = {
  id: number;
  title?: string;
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
  cast?: UpdateCastType[];
  links?: Record<string, string>;
  translations?: Record<string, MovieTranslationType>;
};

export type UpdateMovieTypeWithoutId = Omit<UpdateMovieType, 'id'>;
