
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
import { Platform } from '@prisma/client';
import { PlatformService } from './platform.service';
import {GetPlatformsType} from "./types/getPlatforms.type";
import {RolesGuard} from "../../../common/guards/RolesGuard/roles.guard";
import {Roles} from "../../../common/decorators/roles.decorator";
import {CreatePlatformType} from "./types/createPlatform.type";
import {UpdatePlatformTypeWithoutId} from "./types/updatePlatform.type";

@Controller('platform')
export class PlatformController {
  constructor(private readonly platformService: PlatformService) {}

  @Get(':id')
  async getPlatform(@Param('id', ParseIntPipe) id: number): Promise<Platform> {
    return this.platformService.getPlatform(id);
  }

  @Get()
  async getPlatforms(
    @Query() getPlatformsData: GetPlatformsType,
  ): Promise<Platform[]> {
    return this.platformService.getPlatforms(getPlatformsData);
  }

  @UseGuards(RolesGuard)
  @Roles('admin', 'developer', 'editor')
  @Post()
  async createPlatform(
    @Body() createPlatformData: CreatePlatformType,
  ): Promise<Platform> {
    return this.platformService.createPlatform(createPlatformData);
  }

  @UseGuards(RolesGuard)
  @Roles('admin', 'developer', 'editor')
  @Put(':id')
  async updatePlatform(
    @Body() updatePlatformData: UpdatePlatformTypeWithoutId,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Platform> {
    return this.platformService.updatePlatform({
      ...updatePlatformData,
      id: id,
    });
  }

  @UseGuards(RolesGuard)
  @Roles('admin', 'developer', 'editor')
  @Delete(':id')
  async deletePlatform(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Platform> {
    return this.platformService.deletePlatform(id);
  }
}
