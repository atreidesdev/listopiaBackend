import { AgeRating, GameStatus } from '@prisma/client';
import {CreateCastDataWithoutId} from "../../cast/types/createCast.type";

export type GameTranslationType = {
  title: string;
  description?: string;
};

export type CreateGameType = {
  title: string;
  description?: string;
  developers_ids?: number[];
  publishers_ids?: number[];
  platforms_ids?: number[];
  poster?: Express.Multer.File;
  release?: Date;
  ageRating?: AgeRating;
  status?: GameStatus;
  genres_ids?: number[];
  themes_ids?: number[];
  franchise_ids?: number[];
  cast?: CreateCastDataWithoutId[];
  links?: Record<string, string>;
  translations?: Record<string, GameTranslationType>;
};
