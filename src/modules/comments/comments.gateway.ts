import { ConfigService } from '@nestjs/config';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import {
  BookComment,
  ContentType,
  GameComment,
  MovieComment,
  NewsComment,
  PostComment,
} from '@prisma/client';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: new ConfigService().get('ALLOWED_ORIGINS'),
    methods: ['GET', 'POST'],
  },
})
export class CommentsGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    client: Socket,
    payload: { contentType: ContentType; contentId: number },
  ) {
    const room = `${payload.contentType}-${payload.contentId}`;
    client.join(room);
  }

  notifyNewComment(
    contentType: ContentType,
    contentId: number,
    comment:
      | MovieComment
      | BookComment
      | GameComment
      | NewsComment
      | PostComment,
  ) {
    const room = `${contentType}-${contentId}`;
    this.server.to(room).emit('newComment', comment);
  }
}
