
import { Injectable } from '@nestjs/common';
import { ContentType } from '@prisma/client';
import { CommentsGateway } from './comments.gateway';
import {PrismaService} from "../../../prisma/prisma.service";
import {GetCommentsType} from "./types/getComments.type";
import {CreateCommentType} from "./types/createComment.type";

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly commentsGateway: CommentsGateway,
  ) {}

  async getComments(getCommentsData: GetCommentsType) {
    const { contentType, contentId, page } = getCommentsData;

    const pageSize = 10;

    const model = this.getModelName(contentType);
    const contentIdField = this.getContentIdField(contentType);

    const comments = await this.prisma[model].findMany({
      where: {
        [contentIdField]: contentId,
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
        replies: true,
      },
    });

    const total = await this.prisma[model].count({
      where: {
        [contentIdField]: contentId,
      },
    });

    return {
      comments,
      totalPages: Math.ceil(total / pageSize),
      currentPage: page,
    };
  }

  async createComment(createCommentData: CreateCommentType) {
    const { text, contentId, contentType, parentId, userId } =
      createCommentData;

    const data: any = {
      text,
      userId,
      parentId,
    };

    const model = this.getModelName(contentType);
    const contentIdField = this.getContentIdField(contentType);

    data[contentIdField] = contentId;

    const newComment = await this.prisma[model].create({
      data,
    });

    this.commentsGateway.notifyNewComment(contentType, contentId, newComment);

    return newComment;
  }

  private getModelName(contentType: ContentType): string {
    switch (contentType) {
      case 'book':
        return 'bookComment';
      case 'game':
        return 'gameComment';
      case 'movie':
        return 'movieComment';
      case 'post':
        return 'postComment';
      case 'news':
        return 'newsComment';
      default:
        throw new Error(`Unknown content type: ${contentType}`);
    }
  }

  private getContentIdField(contentType: ContentType): string {
    switch (contentType) {
      case 'book':
        return 'bookId';
      case 'game':
        return 'gameId';
      case 'movie':
        return 'movieId';
      case 'news':
        return 'newsId';
      case 'post':
        return 'postId';
      default:
        throw new Error(`Unknown content type: ${contentType}`);
    }
  }
}
