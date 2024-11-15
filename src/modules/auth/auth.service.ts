import {PrismaService} from "../../../prisma/prisma.service";

import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import {LoginType} from "./types/login.type";
import {RegisterType} from "./types/register.type";
import {RefreshTokenType} from "./types/refresh-token.type";
import {UserPayload} from "./types/user-payload.type";
import {LogoutType} from "./types/logout.type";

@Injectable()
export class AuthService {
  private readonly MAX_ATTEMPTS = 5;
  private readonly INITIAL_LOCKOUT_PERIOD_MS = 5 * 60 * 1000;
  private readonly RESET_ATTEMPTS_PERIOD_MS = 15 * 60 * 1000;
  private readonly MIN_PASSWORD_LENGTH = 8;
  private readonly PASSWORD_REGEX =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      return user;
    }

    return null;
  }

  async login(loginData: LoginType, ipAddress: string) {
    const { email, password } = loginData;
    const user = await this.validateUser(email, password);

    if (!user) {
      await this.handleFailedLoginAttempt(ipAddress, email);
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    await this.handleSuccessfulLoginAttempt(user.id, ipAddress);

    const payload = {
      id: user.id,
      username: user.username,
      role: user.role,
      ...(user.avatarPath && { avatar: user.avatarPath }),
      ...(user.profileName && { profileName: user.profileName }),
    };

    const refreshToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
        active: true,
      },
    });

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: refreshToken,
    };
  }

  private async handleFailedLoginAttempt(
    ipAddress: string,
    usernameOrEmail: string,
  ) {
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
        let newAttemptCount = loginAttempt.attemptCount + 1;
        let newBlockEndTime = blockEndTime;
        let newLockMultiplier = loginAttempt.lockMultiplier;

        if (
          now.getTime() - new Date(loginAttempt.lastAttemptTime).getTime() >=
          this.RESET_ATTEMPTS_PERIOD_MS
        ) {
          newAttemptCount = 1;
          newBlockEndTime = null;
          newLockMultiplier = loginAttempt.lockMultiplier;
        }

        if (newAttemptCount == this.MAX_ATTEMPTS) {
          newLockMultiplier *= 2;
          newBlockEndTime = new Date(
            now.getTime() + this.INITIAL_LOCKOUT_PERIOD_MS * newLockMultiplier,
          );
          newAttemptCount = 0;
        }

        await this.prisma.loginAttempt.update({
          where: { id: loginAttempt.id },
          data: {
            attemptCount: newAttemptCount,
            lastAttemptTime: now,
            blockEndTime: newBlockEndTime,
            lockMultiplier: newLockMultiplier,
          },
        });
      } else {
        await this.prisma.loginAttempt.create({
          data: {
            ipAddress,
            userId: user.id,
            attemptCount: 1,
            lastAttemptTime: now,
            blockEndTime: null,
            lockMultiplier: 1,
          },
        });
      }
    }
  }

  private async handleSuccessfulLoginAttempt(
    userId: number,
    ipAddress: string,
  ) {
    const now = new Date();
    const loginAttempt = await this.prisma.loginAttempt.findFirst({
      where: {
        ipAddress,
        userId,
      },
    });

    if (loginAttempt) {
      await this.prisma.loginAttempt.update({
        where: { id: loginAttempt.id },
        data: {
          attemptCount: 0,
          lastAttemptTime: now,
          blockEndTime: null,
        },
      });
    }
  }

  async register(registerData: RegisterType, ip: string) {
    const { email, password, username } = registerData;

    if (!email || !password || !username) {
      throw new BadRequestException('All fields are required');
    }

    if (!this.isValidEmail(email)) {
      throw new BadRequestException('Invalid email format');
    }

    if (!this.isValidPassword(password)) {
      throw new BadRequestException(
        `Password must be at least ${this.MIN_PASSWORD_LENGTH} characters long and include uppercase, lowercase, and numeric characters.`,
      );
    }

    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new ConflictException('Email already in use');
      }
      if (existingUser.username === username) {
        throw new ConflictException('Username already in use');
      }
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        username,
        profileName: username,
      },
    });

    const loginData: LoginType = { email: email, password };
    return this.login(loginData, ip);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPassword(password: string): boolean {
    return (
      password.length >= this.MIN_PASSWORD_LENGTH &&
      this.PASSWORD_REGEX.test(password)
    );
  }

  async refreshToken(refreshTokenData: RefreshTokenType) {
    const { refreshToken } = refreshTokenData;

    const token = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!token || !token.active || token.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const newRefreshToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await this.prisma.$transaction(async (prisma) => {
      await prisma.refreshToken.update({
        where: { token: refreshToken },
        data: { active: false },
      });

      await prisma.refreshToken.create({
        data: {
          token: newRefreshToken,
          userId: token.userId,
          expiresAt,
          active: true,
        },
      });
    });

    const user = await this.prisma.user.findUnique({
      where: { id: token.userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const payload: UserPayload = {
      id: user.id,
      username: user.username,
      role: user.role,
      ...(user.avatarPath && { avatar: user.avatarPath }),
      ...(user.profileName && { profileName: user.profileName }),
    };

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: newRefreshToken,
    };
  }

  async logout(logoutData: LogoutType) {
    const { userId, refreshToken } = logoutData;

    const token = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!token || token.userId !== userId) {
      throw new Error('Invalid refresh token');
    }

    await this.prisma.refreshToken.delete({
      where: { token: refreshToken },
    });

    return { message: 'Logged out successfully' };
  }
}
