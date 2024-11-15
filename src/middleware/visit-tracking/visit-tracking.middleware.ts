import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import {PrismaService} from "../../../prisma/prisma.service";

@Injectable()
export class VisitTrackingMiddleware implements NestMiddleware {
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

  use(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const path = req.route.path.split('/')[1];

    res.on('finish', async () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        if (id && path) {
          const model = this.pathToModelMap[`/${path}`];

          if (model) {
            await this.prisma[model].update({
              where: { id: Number(id) },
              data: {
                visitCount: {
                  increment: 1,
                },
              },
            });
          }
        }

        if (req.query.page && req.query.page === '1') {
          const genreIds = req.query.genreIds as string[] | undefined;
          const themeIds = req.query.themeIds as string[] | undefined;

          if (genreIds && Array.isArray(genreIds)) {
            const genreIdsNumber = genreIds.map(Number);
            await Promise.all(
              genreIdsNumber.map(async (genreId) => {
                await this.prisma.genre.update({
                  where: { id: genreId },
                  data: {
                    visitCount: {
                      increment: 1,
                    },
                  },
                });
              }),
            );
          }

          if (themeIds && Array.isArray(themeIds)) {
            const themeIdsNumber = themeIds.map(Number);
            await Promise.all(
              themeIdsNumber.map(async (themeId) => {
                await this.prisma.theme.update({
                  where: { id: themeId },
                  data: {
                    visitCount: {
                      increment: 1,
                    },
                  },
                });
              }),
            );
          }
        }
      }
    });

    next();
  }
}
