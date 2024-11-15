import { Global, Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import {HttpExceptionFilter} from "./http-exception/http-exception.filter";

@Global()
@Module({
  providers: [
    HttpExceptionFilter,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
  exports: [HttpExceptionFilter],
})
export class FiltersModule {}
