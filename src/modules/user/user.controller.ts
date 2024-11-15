import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import {JwtAuthGuard} from "../../common/guards/JWTGuard/jwt-auth.guard";
import {UserPayload} from "../auth/types/user-payload.type";
import {CurrentUser} from "../../common/decorators/current-user.decorator";

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('')
  async getAllUsers() {
    return this.userService.getUsers();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getUserById(id);
  }

  @Put(':id/email')
  @UseGuards(JwtAuthGuard)
  async updateEmail(
    @Param('id', ParseIntPipe) id: number,
    @Body('email') email: string,
    @CurrentUser() user: UserPayload,
  ) {
    if (user.id !== id) {
      throw new UnauthorizedException(
        'You are not authorized to update this user',
      );
    }

    return this.userService.updateEmail(id, email);
  }

  @Put(':id/password')
  @UseGuards(JwtAuthGuard)
  async updatePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body('currentPassword') currentPassword: string,
    @Body('password') newPassword: string,
    @CurrentUser() user: UserPayload,
  ) {
    if (user.id !== id) {
      throw new UnauthorizedException(
        'You are not authorized to update this user',
      );
    }

    return this.userService.updatePassword(id, currentPassword, newPassword);
  }

  @Put(':id/username')
  @UseGuards(JwtAuthGuard)
  async updateUsername(
    @Param('id', ParseIntPipe) id: number,
    @Body('username') username: string,
    @CurrentUser() user: UserPayload,
  ) {
    if (user.id !== id) {
      throw new UnauthorizedException(
        'You are not authorized to update this user',
      );
    }

    return this.userService.updateUsername(id, username);
  }

  @Put(':id/profile-name')
  @UseGuards(JwtAuthGuard)
  async updateProfileName(
    @Param('id', ParseIntPipe) id: number,
    @Body('profileName') profileName: string,
    @CurrentUser() user: UserPayload,
  ) {
    if (user.id !== id) {
      throw new UnauthorizedException(
        'You are not authorized to update this user',
      );
    }

    return this.userService.updateProfileName(id, profileName);
  }

  @Put(':id/avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  async updateUserAvatar(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() avatar: Express.Multer.File,
    @CurrentUser() user: UserPayload,
  ) {
    if (user.id !== id) {
      throw new UnauthorizedException(
        'You are not authorized to update this user',
      );
    }
    return this.userService.updateAvatar(id, avatar);
  }

  @Get('profile/:username')
  async getUserProfile(@Param('username') username: string) {
    return this.userService.getUserProfileByUsername(username);
  }
}
