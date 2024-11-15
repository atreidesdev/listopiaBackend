
import { Body, Controller, Ip, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import {LoginType} from "./types/login.type";
import {RegisterType} from "./types/register.type";
import {RefreshTokenType} from "./types/refresh-token.type";
import {JwtAuthGuard} from "../../common/guards/JWTGuard/jwt-auth.guard";
import {LogoutType} from "./types/logout.type";

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginData: LoginType, @Ip() ip: string) {
    return this.authService.login(loginData, ip);
  }

  @Post('register')
  async register(@Body() registerData: RegisterType, @Ip() ip: string) {
    console.log(registerData);
    return this.authService.register(registerData, ip);
  }

  @Post('refresh-token')
  async refreshToken(@Body() refreshTokenData: RefreshTokenType) {
    return this.authService.refreshToken(refreshTokenData);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Body('refreshToken') logoutData: LogoutType) {
    return this.authService.logout(logoutData);
  }
}
