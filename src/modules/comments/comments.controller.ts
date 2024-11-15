import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ContentType } from '@prisma/client';
import { CommentsService } from './comments.service';
import {JwtAuthGuard} from "../../common/guards/JWTGuard/jwt-auth.guard";
import {CreateCommentType} from "./types/createComment.type";
import {CurrentUser} from "../../common/decorators/current-user.decorator";
import {UserPayload} from "../auth/types/user-payload.type";
import {GetCommentsType} from "./types/getComments.type";

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':contentType/:contentId')
  async createComment(
    @Param('contentType') contentType: string,
    @Param('contentId', ParseIntPipe) contentId: number,
    @Body()
    createCommentData: Omit<
      CreateCommentType,
      'contentType' | 'contentId' | 'userId'
    >,
    @CurrentUser() user: UserPayload,
  ) {
    const data: CreateCommentType = {
      ...createCommentData,
      contentType: contentType as ContentType,
      contentId: contentId,
      userId: user.id,
    };
    return this.commentsService.createComment(data);
  }

  @Get(':contentType/:contentId')
  async getComments(
    @Param('contentType') contentType: string,
    @Param('contentId', ParseIntPipe) contentId: number,
    @Query('page') page: number = 1,
  ) {
    const getCommentsData: GetCommentsType = {
      contentType: contentType as ContentType,
      contentId: contentId,
      page: page,
    };
    return this.commentsService.getComments(getCommentsData);
  }
}
