import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import {UserPayload} from "../../modules/auth/types/user-payload.type";

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
