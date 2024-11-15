import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import {PrismaService} from "../../../prisma/prisma.service";
import {FileUtil} from "../../common/utils/file.util";

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileUtil: FileUtil,
  ) {}

  async getUsers(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async getUserById(id: number): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  async deactivateUser(id: number): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { active: false },
    });
  }

  async setUserRole(id: number, role: UserRole): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { role },
    });
  }

  async updateEmail(userId: number, email: string): Promise<User> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new UnauthorizedException('Email is already in use');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { email },
    });
  }
  async updatePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    return this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });
  }

  async updateUsername(userId: number, username: string): Promise<User> {
    const existingUser = await this.prisma.user.findUnique({
      where: { username },
    });
    if (existingUser) {
      throw new UnauthorizedException('Username is already taken');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { username },
    });
  }

  async updateProfileName(userId: number, profileName: string): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { profileName },
    });
  }

  async updateAvatar(
    userId: number,
    avatar: Express.Multer.File,
  ): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) throw new UnauthorizedException('User not found');

    let avatarPath: string;

    if (user.avatarPath) {
      avatarPath = await this.fileUtil.updateFile(
        avatar,
        user.avatarPath,
        user.username,
        'users_avatars',
      );
    } else {
      avatarPath = await this.fileUtil.saveFile({
        file: avatar,
        filename: user.username + user.id,
        folder: 'users_avatars',
      });
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { avatarPath },
    });
  }

  async getUserProfileByUsername(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: {
        BookListItem: true,
        MovieListItem: true,
        GameListItem: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const bookCount = await this.prisma.bookListItem.count({
      where: { userId: user.id },
    });

    const movieCount = await this.prisma.movieListItem.count({
      where: { userId: user.id },
    });

    const gameCount = await this.prisma.gameListItem.count({
      where: { userId: user.id },
    });

    const statusCount = await this.getStatusCount(user.id);

    return {
      username: user.username,
      profileName: user.profileName,
      avatarPath: user.avatarPath,
      bookCount,
      movieCount,
      gameCount,
      statusCount,
    };
  }

  private async getStatusCount(userId: number) {
    const bookStatusCount = await this.prisma.bookListItem.groupBy({
      by: ['status'],
      where: { userId },
      _count: {
        status: true,
      },
    });

    const movieStatusCount = await this.prisma.movieListItem.groupBy({
      by: ['status'],
      where: { userId },
      _count: {
        status: true,
      },
    });

    const gameStatusCount = await this.prisma.gameListItem.groupBy({
      by: ['status'],
      where: { userId },
      _count: {
        status: true,
      },
    });

    return {
      books: bookStatusCount,
      movies: movieStatusCount,
      games: gameStatusCount,
    };
  }
}
