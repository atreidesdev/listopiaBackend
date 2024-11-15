
import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppConfigModule } from './config/app-config.module';
import { MiddlewareModule } from './middleware/middleware.module';
import { TaskRunnersModule } from './task-runners/task-runners.module';
import {GuardsModule} from "./common/guards/guards.module";
import {UtilsModule} from "./common/utils/utils.module";
import {PrismaModule} from "../prisma/prisma.module";
import {AuthModule} from "./modules/auth/auth.module";
import {UserModule} from "./modules/user/user.module";
import {ContentModule} from "./modules/content/content.module";
import {FiltersModule} from "./common/filters/filters.module";

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    GuardsModule,
    UtilsModule,
    PrismaModule,
    AuthModule,
    UserModule,
    ContentModule,
    AppConfigModule,
    MiddlewareModule,
    FiltersModule,
    TaskRunnersModule,
  ],
})
export class AppModule {}
