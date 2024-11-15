import { Controller, Param, Post } from '@nestjs/common';
import { GenreType } from '@prisma/client';
import { RecommendationService } from './recommendation.service';

@Controller('recommendations')
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  @Post('update/:genreType')
  async updateSimilarItems(@Param('genreType') genreType: string) {
    const type = genreType.toUpperCase() as GenreType;
    if (!['book', 'movie', 'game'].includes(type)) {
      throw new Error(`Invalid content type: ${genreType}`);
    }
    await this.recommendationService.updateSimilarItems(type);
    return { message: `Update for ${genreType} initiated.` };
  }
}
