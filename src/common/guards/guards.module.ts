
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {RolesGuard} from "./RolesGuard/roles.guard";
import {JwtAuthGuard} from "./JWTGuard/jwt-auth.guard";

@Global()
@Module({
  providers: [RolesGuard, JwtAuthGuard, JwtService, ConfigService],
  exports: [RolesGuard, JwtAuthGuard, JwtService],
})
export class GuardsModule {}
