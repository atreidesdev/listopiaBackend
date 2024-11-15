import { PrismaService } from "prisma/prisma.service";
import {Injectable} from "@nestjs/common";
import {FileUtil} from "../../../common/utils/file.util";
import {Developer, Prisma} from "@prisma/client";
import {GetDevelopersType} from "./types/getDevelopers.type";
import {CreateDeveloperType} from "./types/createDeveloper.type";
import {UpdateDeveloperType} from "./types/updateDeveloper.type";

@Injectable()
export class DeveloperService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileUtil: FileUtil,
  ) {}

  async getDeveloper(id: number): Promise<Developer> {
    const existingDeveloper = await this.prisma.developer.findUnique({
      where: { id: id },
    });

    if (!existingDeveloper) {
      throw new Error('developer not found');
    }

    return this.prisma.developer.findUnique({ where: { id } });
  }

  async getDevelopers(
    getDevelopersData: GetDevelopersType,
  ): Promise<Developer[]> {
    const { page, pageSize, sortField, sortOrder } = getDevelopersData;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    let orderBy: Prisma.DeveloperOrderByWithRelationInput = {
      visitCount: 'desc',
    };

    if (sortField && sortOrder) {
      orderBy = { [sortField]: sortOrder };
    }

    return this.prisma.developer.findMany({
      skip,
      take,
      orderBy,
    });
  }

  async createDeveloper(
    createDeveloperData: CreateDeveloperType,
  ): Promise<Developer> {
    const { name, description, logo } = createDeveloperData;

    let logoPath = '';
    if (logo) {
      logoPath = await this.fileUtil.saveFile({
        file: logo,
        filename: `${name}_${Date.now()}`,
        folder: 'developers_logos',
      });
    }

    return this.prisma.developer.create({
      data: {
        name: name,
        description: description,
        logoPath: logoPath,
      },
    });
  }

  async updateDeveloper(
    updateDeveloperData: UpdateDeveloperType,
  ): Promise<Developer> {
    const { id, name, description, logo } = updateDeveloperData;

    const existingDeveloper = await this.prisma.developer.findUnique({
      where: { id: id },
    });

    if (!existingDeveloper) {
      throw new Error('developer not found');
    }

    let logoPath = existingDeveloper.logoPath;
    if (logo) {
      if (logoPath) {
        logoPath = await this.fileUtil.updateFile(
          logo,
          logoPath,
          `${name}_${Date.now()}`,
          'developers_logos',
        );
      } else {
        logoPath = await this.fileUtil.saveFile({
          file: logo,
          filename: `${name}_${Date.now()}`,
          folder: 'developers_logos',
        });
      }
    }

    return this.prisma.developer.update({
      where: { id },
      data: {
        name: name ?? existingDeveloper.name,
        description: description ?? existingDeveloper.description,
        logoPath: logoPath ?? existingDeveloper.logoPath,
      },
    });
  }

  async deleteDeveloper(id: number): Promise<Developer> {
    const existingDeveloper = await this.prisma.developer.findUnique({
      where: { id: id },
    });

    if (!existingDeveloper) {
      throw new Error('developer not found');
    }

    if (existingDeveloper.logoPath) {
      await this.fileUtil.deleteFile(existingDeveloper.logoPath);
    }

    return this.prisma.developer.delete({ where: { id: id } });
  }
}
