import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Request } from 'express';
import {PrismaService} from "../../../../prisma/prisma.service";

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(req: Request, next: NextFunction) {
    const { usernameOrEmail } = req.body;
    const ipAddress = req.ip;
    const now = new Date();

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
      },
    });

    if (user) {
      const loginAttempt = await this.prisma.loginAttempt.findFirst({
        where: {
          ipAddress,
          userId: user.id,
        },
      });

      if (loginAttempt) {
        const blockEndTime = loginAttempt.blockEndTime
          ? new Date(loginAttempt.blockEndTime)
          : null;

        if (blockEndTime && now < blockEndTime) {
          const timeRemaining = blockEndTime.getTime() - now.getTime();
          const minutesRemaining = Math.ceil(timeRemaining / (1000 * 60));
          throw new UnauthorizedException(
            `Too many failed attempts. Try again in ${minutesRemaining} minutes.`,
          );
        }
      }
    }

    next();
  }
}
