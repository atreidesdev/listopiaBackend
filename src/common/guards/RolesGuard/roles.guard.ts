import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { UserRole } from '@prisma/client';
import {JwtAuthGuard} from "../JWTGuard/jwt-auth.guard";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtAuthGuard: JwtAuthGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const jwtCanActivate = await this.jwtAuthGuard.canActivate(context);
    if (!jwtCanActivate) {
      return false;
    }

    const roles = this.reflector.get<UserRole[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }

    const ctxType = context.getType<string>();

    let user: { role: UserRole };

    if (ctxType === 'http') {
      const httpContext = context.switchToHttp();
      const request = httpContext.getRequest();
      user = request.user;
    } else if (ctxType === 'graphql') {
      const gqlContext = GqlExecutionContext.create(context);
      const request = gqlContext.getContext().req;
      user = request.user;
    } else {
      throw new UnauthorizedException('Unsupported context type');
    }

    if (!user || !roles.includes(user.role)) {
      throw new UnauthorizedException('Insufficient role');
    }

    return true;
  }
}
