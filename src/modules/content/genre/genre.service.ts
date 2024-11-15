
import { Injectable } from '@nestjs/common';
import { GenreType, Genre } from '@prisma/client';
import {PrismaService} from "../../../../prisma/prisma.service";
import {CreateGenreType} from "./types/createGenre.type";
import {UpdateGenreType} from "./types/updateGenre.type";

@Injectable()
export class GenreService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllGenres(): Promise<Genre[]> {
    return this.prisma.genre.findMany();
  }

  async getGenresByType(type: GenreType): Promise<Genre[]> {
    return this.prisma.genre.findMany({
      where: {
        genreTypes: {
          has: type,
        },
      },
    });
  }

  async createGenre(createGenreData: CreateGenreType): Promise<Genre> {
    const { name, description, genreTypes } = createGenreData;
    const existingGenre = await this.prisma.genre.findFirst({
      where: { name: name.toLowerCase() },
    });

    if (existingGenre) {
      throw new Error(`Genre with NAME ${name} already exists`);
    }

    return this.prisma.genre.create({
      data: {
        name: name.toLowerCase(),
        description,
        genreTypes: { set: genreTypes },
      },
    });
  }

  async updateGenre(updateGenreData: UpdateGenreType): Promise<Genre> {
    const { id, name, description, genreTypes } = updateGenreData;
    const existingGenre = await this.prisma.genre.findUnique({
      where: { id },
    });

    if (!existingGenre) {
      throw new Error(`Genre with ID ${id} does not exist`);
    }

    return this.prisma.genre.update({
      where: { id },
      data: {
        name: name.toLowerCase() ?? existingGenre.name,
        description: description ?? existingGenre.description,
        genreTypes: genreTypes ?? existingGenre.genreTypes,
      },
    });
  }

  async deleteGenre(id: number): Promise<Genre> {
    const existingGenre = await this.prisma.genre.findUnique({
      where: { id },
    });

    if (!existingGenre) {
      throw new Error(`Genre with ID ${id} does not exist`);
    }
    return this.prisma.genre.delete({
      where: {
        id: id,
      },
    });
  }
}
