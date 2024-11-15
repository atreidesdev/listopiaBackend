
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { GenreType, ListItemStatus } from '@prisma/client';
import { HistoryInterceptor } from '../../../middleware/history/history.interceptor';
import { ListService } from './list.service';
import {JwtAuthGuard} from "../../../common/guards/JWTGuard/jwt-auth.guard";
import {
  ListBookMaxPagesType,
  ListItemCurrentType,
  ListItemNoteType,
  ListItemRatingType,
  ListItemReviewType, ListItemType
} from "./types/listItem.type";
import {UserPayload} from "../../auth/types/user-payload.type";
import {CurrentUser} from "../../../common/decorators/current-user.decorator";

@Controller('list')
export class ListController {
  constructor(private readonly listService: ListService) {}

  @UseGuards(JwtAuthGuard)
  @Put(':genreType/:contentId/note')
  async updateNote(
    @Param('genreType') genreType: GenreType,
    @Param('contentId', ParseIntPipe) contentId: number,
    @Body()
    data: Omit<ListItemNoteType, 'userId' | 'genreType' | 'contentId'>,
    @CurrentUser() user: UserPayload,
  ) {
    const userId = user.id;
    return this.listService.updateNote({
      ...data,
      userId,
      genreType,
      contentId,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Put(':genreType/:contentId/rating')
  async updateRating(
    @Param('genreType') genreType: GenreType,
    @Param('contentId', ParseIntPipe) contentId: number,
    @Body()
    data: Omit<ListItemRatingType, 'userId' | 'genreType' | 'contentId'>,
    @CurrentUser() user: UserPayload,
  ) {
    const userId = user.id;
    return this.listService.updateRating({
      ...data,
      userId,
      genreType,
      contentId,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Put(':genreType/:contentId/review')
  async updateReview(
    @Param('genreType') genreType: GenreType,
    @Param('contentId', ParseIntPipe) contentId: number,
    @Body()
    data: Omit<ListItemReviewType, 'userId' | 'genreType' | 'contentId'>,
    @CurrentUser() user: UserPayload,
  ) {
    const userId = user.id;
    return this.listService.updateReview({
      ...data,
      userId,
      genreType,
      contentId,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Put(':genreType/:contentId/current')
  async updateCurrent(
    @Param('genreType') genreType: GenreType,
    @Param('contentId', ParseIntPipe) contentId: number,
    @Body()
    data: Omit<ListItemCurrentType, 'userId' | 'genreType' | 'contentId'>,
    @CurrentUser() user: UserPayload,
  ) {
    const userId = user.id;
    return this.listService.updateCurrent({
      ...data,
      userId,
      genreType,
      contentId,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Put(':genreType/:contentId/maxPages')
  async updateMaxPages(
    @Param('genreType') genreType: GenreType,
    @Param('contentId', ParseIntPipe) contentId: number,
    @Body()
    data: Omit<ListBookMaxPagesType, 'userId' | 'genreType' | 'contentId'>,
    @CurrentUser() user: UserPayload,
  ) {
    const userId = user.id;
    return this.listService.updateMaxPages({
      ...data,
      userId,
      genreType,
      contentId,
    });
  }

  @UseInterceptors(HistoryInterceptor)
  @UseGuards(JwtAuthGuard)
  @Post(':genreType/:contentId')
  async addOrUpdateListItem(
    @Param('genreType') genreType: GenreType,
    @Param('contentId', ParseIntPipe) contentId: number,
    @Body() data: Omit<ListItemType, 'userId' | 'genreType' | 'contentId'>,
    @CurrentUser() user: UserPayload,
  ) {
    const userId = user.id;
    return this.listService.addOrUpdateListItem({
      ...data,
      userId,
      genreType,
      contentId,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':genreType/:contentId')
  async deleteListItem(
    @Param('genreType') genreType: GenreType,
    @Param('contentId', ParseIntPipe) contentId: number,
    @CurrentUser() user: UserPayload,
  ) {
    const userId = user.id;
    return this.listService.deleteListItem({ userId, genreType, contentId });
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllListItems(@CurrentUser() user: UserPayload) {
    const userId = user.id;
    return this.listService.getAllListItemsByUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':genreType/:status')
  async getListItemsByTypeAndStatus(
    @Param('genreType') genreType: GenreType,
    @Param('status') status: ListItemStatus,
    @CurrentUser() user: UserPayload,
  ) {
    const userId = user.id;
    return this.listService.getListItemsByTypeAndStatus({
      userId,
      genreType,
      status,
    });
  }
}
