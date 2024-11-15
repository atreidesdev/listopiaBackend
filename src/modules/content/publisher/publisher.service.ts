
import { Injectable } from '@nestjs/common';
import { Prisma, Publisher } from '@prisma/client';
import {PrismaService} from "../../../../prisma/prisma.service";
import {FileUtil} from "../../../common/utils/file.util";
import {GetPublishersType} from "./types/getPublishers.type";
import {CreatePublisherType} from "./types/createPublisher.type";
import {UpdatePublisherType} from "./types/updatePublisher.type";

@Injectable()
export class PublisherService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileUtil: FileUtil,
  ) {}

  async getPublisher(id: number): Promise<Publisher> {
    const existingPublisher = await this.prisma.publisher.findUnique({
      where: { id: id },
    });

    if (!existingPublisher) {
      throw new Error('Publisher not found');
    }

    return this.prisma.publisher.findUnique({ where: { id } });
  }

  async getPublishers(
    getPublishersData: GetPublishersType,
  ): Promise<Publisher[]> {
    const { page, pageSize, sortField, sortOrder } = getPublishersData;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    let orderBy: Prisma.PublisherOrderByWithRelationInput = {
      visitCount: 'desc',
    };

    if (sortField && sortOrder) {
      orderBy = { [sortField]: sortOrder };
    }

    return this.prisma.publisher.findMany({
      skip,
      take,
      orderBy,
    });
  }

  async createPublisher(
    createPublisherData: CreatePublisherType,
  ): Promise<Publisher> {
    const { name, description, logo } = createPublisherData;

    let logoPath = '';
    if (logo) {
      logoPath = await this.fileUtil.saveFile({
        file: logo,
        filename: `${name}_${Date.now()}`,
        folder: 'publishers_logos',
      });
    }

    return this.prisma.publisher.create({
      data: {
        name: name,
        description: description,
        logoPath: logoPath,
      },
    });
  }

  async updatePublisher(
    updatePublisherData: UpdatePublisherType,
  ): Promise<Publisher> {
    const { id, name, description, logo } = updatePublisherData;

    const existingPublisher = await this.prisma.publisher.findUnique({
      where: { id: id },
    });

    if (!existingPublisher) {
      throw new Error('Publisher not found');
    }

    let logoPath = existingPublisher.logoPath;
    if (logo) {
      if (logoPath) {
        logoPath = await this.fileUtil.updateFile(
          logo,
          logoPath,
          `${name}_${Date.now()}`,
          'publishers_logos',
        );
      } else {
        logoPath = await this.fileUtil.saveFile({
          file: logo,
          filename: `${name}_${Date.now()}`,
          folder: 'publishers_logos',
        });
      }
    }

    return this.prisma.publisher.update({
      where: { id },
      data: {
        name: name ?? existingPublisher.name,
        description: description ?? existingPublisher.description,
        logoPath: logoPath ?? existingPublisher.logoPath,
      },
    });
  }

  async deletePublisher(id: number): Promise<Publisher> {
    const existingPublisher = await this.prisma.publisher.findUnique({
      where: { id: id },
    });
    if (!existingPublisher) {
      throw new Error('Publisher not found');
    }

    if (existingPublisher.logoPath) {
      await this.fileUtil.deleteFile(existingPublisher.logoPath);
    }
    return this.prisma.publisher.delete({ where: { id: id } });
  }
}
