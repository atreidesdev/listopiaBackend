
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Publisher } from '@prisma/client';
import { PublisherService } from './publisher.service';
import {GetPublishersType} from "./types/getPublishers.type";
import {RolesGuard} from "../../../common/guards/RolesGuard/roles.guard";
import {Roles} from "../../../common/decorators/roles.decorator";
import {CreatePublisherType} from "./types/createPublisher.type";
import {UpdatePublisherTypeWithoutId} from "./types/updatePublisher.type";

@Controller('publisher')
export class PublisherController {
  constructor(private readonly publisherService: PublisherService) {}

  @Get(':id')
  async getPublisher(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Publisher> {
    return this.publisherService.getPublisher(id);
  }

  @Get()
  async getPublishers(
    @Query() getPublishersData: GetPublishersType,
  ): Promise<Publisher[]> {
    return this.publisherService.getPublishers(getPublishersData);
  }

  @UseGuards(RolesGuard)
  @Roles('admin', 'developer', 'editor')
  @Post()
  async createPublisher(
    @Body() createPublisherData: CreatePublisherType,
  ): Promise<Publisher> {
    return this.publisherService.createPublisher(createPublisherData);
  }

  @UseGuards(RolesGuard)
  @Roles('admin', 'developer', 'editor')
  @Put(':id')
  async updatePublisher(
    @Body() updatePublisherData: UpdatePublisherTypeWithoutId,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Publisher> {
    return this.publisherService.updatePublisher({
      ...updatePublisherData,
      id: id,
    });
  }

  @UseGuards(RolesGuard)
  @Roles('admin', 'developer', 'editor')
  @Delete(':id')
  async deletePublisher(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Publisher> {
    return this.publisherService.deletePublisher(id);
  }
}
