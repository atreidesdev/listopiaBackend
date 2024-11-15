import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import {PrismaService} from "../../../prisma/prisma.service";

@Injectable()
export class HistoryInterceptor implements NestInterceptor {
  private readonly pathToModelMap: { [key: string]: string } = {
    '/book': 'book',
    '/movie': 'movie',
    '/game': 'game',
    '/character': 'character',
    '/person': 'person',
    '/publisher': 'publisher',
    '/studio': 'studio',
    '/platform': 'platform',
    '/franchise': 'franchise',
    '/collection': 'collection',
    '/developer': 'developer',
  };

  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const path = request.route.path.split('/')[1];

    if (!user || !user.id) {
      throw new Error('User not authenticated');
    }

    const userId = user.id;

    console.log('User ID:', userId, 'Path:', path);

    return next.handle().pipe(tap(async () => {}));
  }
}
