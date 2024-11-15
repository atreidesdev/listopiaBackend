
import { Injectable } from '@nestjs/common';
import {PrismaService} from "../../../../prisma/prisma.service";
import {CreateThemeType} from "./types/createTheme.type";
import {UpdateThemeType} from "./types/updateTheme.type";

@Injectable()
export class ThemeService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllThemes() {
    return this.prisma.theme.findMany();
  }

  async createTheme(createThemeData: CreateThemeType) {
    const { name, description } = createThemeData;

    const existingTheme = await this.prisma.theme.findFirst({
      where: { name: name.toLowerCase() },
    });

    if (existingTheme) {
      throw new Error(`Theme with NAME ${name} already exists`);
    }

    return this.prisma.theme.create({
      data: {
        name: name.toLowerCase(),
        description,
      },
    });
  }

  async updateTheme(updateThemeData: UpdateThemeType) {
    const { id, name, description } = updateThemeData;

    const existingTheme = await this.prisma.theme.findUnique({
      where: { id },
    });

    if (!existingTheme) {
      throw new Error(`Theme with ID ${id} does not exist`);
    }

    return this.prisma.theme.update({
      where: { id },
      data: {
        name: name.toLowerCase() ?? existingTheme.name,
        description: description ?? existingTheme.description,
      },
    });
  }

  async deleteTheme(id: number) {
    const existingTheme = await this.prisma.theme.findUnique({
      where: { id },
    });

    if (!existingTheme) {
      throw new Error(`Theme with ID ${id} does not exist`);
    }
    return this.prisma.theme.delete({
      where: {
        id: id,
      },
    });
  }
}
