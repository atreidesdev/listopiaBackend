
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Book } from '@prisma/client';
import { BookService } from './book.service';
import {CurrentUser} from "../../../common/decorators/current-user.decorator";
import {UserPayload} from "../../auth/types/user-payload.type";
import {GetBooksType} from "./types/getBooks.type";
import {RolesGuard} from "../../../common/guards/RolesGuard/roles.guard";
import {Roles} from "../../../common/decorators/roles.decorator";
import {CreateBookType} from "./types/createBook.type";
import {UpdateBookTypeWithoutId} from "./types/updateBook.type";

@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Get(':id')
  async getBook(
    @Param('id', ParseIntPipe) id: number,
    @Query('lang') lang: string,
    @CurrentUser() user: UserPayload,
  ): Promise<Book> {
    return this.bookService.getBook({ id, userId: user?.id, lang });
  }

  @Get()
  async getBooks(
    @Query() getBooksData: GetBooksType,
    @Query('lang') lang?: string,
  ): Promise<Book[]> {
    if (Object.keys(getBooksData).length === 0) {
      return this.bookService.getAllBooks();
    }
    return this.bookService.getBooks({ ...getBooksData, lang });
  }

  @UseGuards(RolesGuard)
  @Roles('admin', 'developer', 'editor')
  @Post()
  async createBook(@Body() createBookData: CreateBookType): Promise<Book> {
    return this.bookService.createBook(createBookData);
  }

  @Put(':id')
  async updateBook(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBookData: UpdateBookTypeWithoutId,
  ): Promise<Book> {
    return this.bookService.updateBook({ ...updateBookData, id: id });
  }

  @UseGuards(RolesGuard)
  @Roles('admin', 'developer', 'editor')
  @Delete(':id')
  async deleteBook(@Param('id', ParseIntPipe) id: number): Promise<Book> {
    return this.bookService.deleteBook(id);
  }
}
