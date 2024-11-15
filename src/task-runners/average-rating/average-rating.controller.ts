
import {
  BadRequestException,
  Controller,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { GenreType } from '@prisma/client';
import { AverageRatingService } from './average-rating.service';
import {RolesGuard} from "../../common/guards/RolesGuard/roles.guard";
import {Roles} from "../../common/decorators/roles.decorator";

@Controller('average-rating')
export class AverageRatingController {
  constructor(private readonly averageRatingService: AverageRatingService) {}

  @Post(':genreType')
  @UseGuards(RolesGuard)
  @Roles('admin', 'developer')
  async runManualUpdate(@Param('genreType') genreType: GenreType) {
    if (!Object.values(GenreType).includes(genreType)) {
      throw new BadRequestException(`Invalid content type: ${genreType}`);
    }

    await this.averageRatingService.runManualUpdate(genreType);
    return { message: 'Ratings updated successfully' };
  }
}
