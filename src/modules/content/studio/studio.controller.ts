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
import { Studio } from '@prisma/client';
import { StudioService } from './studio.service';
import {GetStudiosType} from "./types/getStudios.type";
import {RolesGuard} from "../../../common/guards/RolesGuard/roles.guard";
import {Roles} from "../../../common/decorators/roles.decorator";
import {CreateStudioType} from "./types/createStudio.type";
import {UpdateStudioTypeWithoutId} from "./types/updateStudio.type";

@Controller('studio')
export class StudioController {
  constructor(private readonly studioService: StudioService) {}

  @Get(':id')
  async getStudio(@Param('id', ParseIntPipe) id: number): Promise<Studio> {
    return this.studioService.getStudio(id);
  }

  @Get()
  async getStudios(@Query() getStudiosData: GetStudiosType): Promise<Studio[]> {
    return this.studioService.getStudios(getStudiosData);
  }

  @UseGuards(RolesGuard)
  @Roles('admin', 'developer', 'editor')
  @Post()
  async createStudio(
    @Body() createStudioData: CreateStudioType,
  ): Promise<Studio> {
    return this.studioService.createStudio(createStudioData);
  }

  @UseGuards(RolesGuard)
  @Roles('admin', 'developer', 'editor')
  @Put(':id')
  async updateStudio(
    @Body() updateStudioData: UpdateStudioTypeWithoutId,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Studio> {
    return this.studioService.updateStudio({ ...updateStudioData, id: id });
  }

  @UseGuards(RolesGuard)
  @Roles('admin', 'developer', 'editor')
  @Delete(':id')
  async deleteStudio(@Param('id', ParseIntPipe) id: number): Promise<Studio> {
    return this.studioService.deleteStudio(id);
  }
}
