
import { AgeRating, GameStatus } from '@prisma/client';
import {UpdateCastType} from "../../cast/types/updateCast.type";
import {GameTranslationType} from "./createGame.type";

export type UpdateGameType = {
  id: number;
  title?: string;
  description?: string;
  developers_ids: number[];
  publishers_ids: number[];
  platforms_ids: number[];
  poster?: Express.Multer.File;
  release?: Date;
  ageRating?: AgeRating;
  status?: GameStatus;
  genres_ids?: number[];
  themes_ids?: number[];
  franchise_ids?: number[];
  cast?: UpdateCastType[];
  links?: Record<string, string>;
  translations?: Record<string, GameTranslationType>;
};

export type UpdateGameTypeWithoutId = Omit<UpdateGameType, 'id'>;
