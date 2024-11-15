
import { Injectable } from '@nestjs/common';
import { Prisma, Studio } from '@prisma/client';
import {PrismaService} from "../../../../prisma/prisma.service";
import {FileUtil} from "../../../common/utils/file.util";
import {GetStudiosType} from "./types/getStudios.type";
import {CreateStudioType} from "./types/createStudio.type";
import {UpdateStudioType} from "./types/updateStudio.type";

@Injectable()
export class StudioService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileUtil: FileUtil,
  ) {}

  async getStudio(id: number): Promise<Studio> {
    const existingStudio = await this.prisma.studio.findUnique({
      where: { id: id },
    });

    if (!existingStudio) {
      throw new Error('Studio not found');
    }

    return this.prisma.studio.findUnique({ where: { id } });
  }

  async getStudios(getStudiosData: GetStudiosType): Promise<Studio[]> {
    const { page, pageSize, sortField, sortOrder } = getStudiosData;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    let orderBy: Prisma.StudioOrderByWithRelationInput = {
      visitCount: 'desc',
    };

    if (sortField && sortOrder) {
      orderBy = { [sortField]: sortOrder };
    }

    return this.prisma.studio.findMany({
      skip,
      take,
      orderBy,
    });
  }

  async createStudio(createStudioData: CreateStudioType): Promise<Studio> {
    const { name, description, logo } = createStudioData;

    let logoPath = '';
    if (logo) {
      logoPath = await this.fileUtil.saveFile({
        file: logo,
        filename: `${name}_${Date.now()}`,
        folder: 'studios_logos',
      });
    }

    return this.prisma.studio.create({
      data: {
        name: name,
        description: description,
        logoPath: logoPath,
      },
    });
  }

  async updateStudio(updateStudioData: UpdateStudioType): Promise<Studio> {
    const { id, name, description, logo } = updateStudioData;

    const existingStudio = await this.prisma.studio.findUnique({
      where: { id: id },
    });

    if (!existingStudio) {
      throw new Error('Studio not found');
    }

    let logoPath = existingStudio.logoPath;
    if (logo) {
      if (logoPath) {
        logoPath = await this.fileUtil.updateFile(
          logo,
          logoPath,
          `${name}_${Date.now()}`,
          'studios_logos',
        );
      } else {
        logoPath = await this.fileUtil.saveFile({
          file: logo,
          filename: `${name}_${Date.now()}`,
          folder: 'studios_logos',
        });
      }
    }

    return this.prisma.studio.update({
      where: { id },
      data: {
        name: name ?? existingStudio.name,
        description: description ?? existingStudio.description,
        logoPath: logoPath ?? existingStudio.logoPath,
      },
    });
  }

  async deleteStudio(id: number): Promise<Studio> {
    const existingStudio = await this.prisma.studio.findUnique({
      where: { id: id },
    });
    if (!existingStudio) {
      throw new Error('Studio not found');
    }

    if (existingStudio.logoPath) {
      await this.fileUtil.deleteFile(existingStudio.logoPath);
    }
    return this.prisma.studio.delete({ where: { id: id } });
  }
}
