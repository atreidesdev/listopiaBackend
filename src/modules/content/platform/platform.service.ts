
import { Injectable } from '@nestjs/common';
import { Platform, Prisma } from '@prisma/client';
import {PrismaService} from "../../../../prisma/prisma.service";
import {FileUtil} from "../../../common/utils/file.util";
import {GetPlatformsType} from "./types/getPlatforms.type";
import {CreatePlatformType} from "./types/createPlatform.type";
import {UpdatePlatformType} from "./types/updatePlatform.type";

@Injectable()
export class PlatformService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileUtil: FileUtil,
  ) {}

  async getPlatform(id: number): Promise<Platform> {
    const existingPlatform = await this.prisma.platform.findUnique({
      where: { id: id },
    });

    if (!existingPlatform) {
      throw new Error('Platform not found');
    }

    return this.prisma.platform.findUnique({ where: { id } });
  }

  async getPlatforms(getPlatformsData: GetPlatformsType): Promise<Platform[]> {
    const { page, pageSize, sortField, sortOrder } = getPlatformsData;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    let orderBy: Prisma.PlatformOrderByWithRelationInput = {
      visitCount: 'desc',
    };

    if (sortField && sortOrder) {
      orderBy = { [sortField]: sortOrder };
    }

    return this.prisma.platform.findMany({
      skip,
      take,
      orderBy,
    });
  }

  async createPlatform(
    createPlatformData: CreatePlatformType,
  ): Promise<Platform> {
    const { name, description, logo } = createPlatformData;

    let logoPath = '';
    if (logo) {
      logoPath = await this.fileUtil.saveFile({
        file: logo,
        filename: `${name}_${Date.now()}`,
        folder: 'platforms_logos',
      });
    }

    return this.prisma.platform.create({
      data: {
        name: name,
        description: description,
        logoPath: logoPath,
      },
    });
  }

  async updatePlatform(
    updatePlatformData: UpdatePlatformType,
  ): Promise<Platform> {
    const { id, name, description, logo } = updatePlatformData;

    const existingPlatform = await this.prisma.platform.findUnique({
      where: { id: id },
    });

    if (!existingPlatform) {
      throw new Error('Platform not found');
    }

    let logoPath = existingPlatform.logoPath;
    if (logo) {
      if (logoPath) {
        logoPath = await this.fileUtil.updateFile(
          logo,
          logoPath,
          `${name}_${Date.now()}`,
          'platforms_logos',
        );
      } else {
        logoPath = await this.fileUtil.saveFile({
          file: logo,
          filename: `${name}_${Date.now()}`,
          folder: 'platforms_logos',
        });
      }
    }

    return this.prisma.platform.update({
      where: { id },
      data: {
        name: name ?? existingPlatform.name,
        description: description ?? existingPlatform.description,
        logoPath: logoPath ?? existingPlatform.logoPath,
      },
    });
  }

  async deletePlatform(id: number): Promise<Platform> {
    const existingPlatform = await this.prisma.platform.findUnique({
      where: { id: id },
    });
    if (!existingPlatform) {
      throw new Error('Platform not found');
    }

    if (existingPlatform.logoPath) {
      await this.fileUtil.deleteFile(existingPlatform.logoPath);
    }
    return this.prisma.platform.delete({ where: { id: id } });
  }
}
