import {PrismaService} from "../../../../prisma/prisma.service";
import {FileUtil} from "../../../common/utils/file.util";
import {CastService} from "../cast/cast.service";
import {FranchiseService} from "../franchise/franchise.service";
import {GetBookWithTranslationType} from "./types/getBook.type";
import {Book, BookListItem, Prisma} from "@prisma/client";
import {GetBooksWithTranslationType} from "./types/getBooks.type";
import {CreateBookType} from "./types/createBook.type";
import {Injectable} from "@nestjs/common";
import {UpdateBookType} from "./types/updateBook.type";
import {createUpdateData} from "../../../common/utils/updateData.util";


@Injectable()
export class BookService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileUtil: FileUtil,
    private readonly castService: CastService,
    private readonly franchiseService: FranchiseService,
  ) {}

  async getBook(
    getBookData: GetBookWithTranslationType,
  ): Promise<Book & { bookListItem?: BookListItem }> {
    const { id, userId, lang = 'ru' } = getBookData;

    const existingBook = await this.prisma.book.findUnique({
      where: { id },
      include: {
        genres: true,
        themes: true,
        authors: true,
      },
    });

    if (!existingBook) {
      throw new Error('Book not found');
    }

    const translations = existingBook.translations || {};
    const translatedBook = {
      ...existingBook,
      title:
        lang === 'ru'
          ? existingBook.title
          : translations[lang]?.title || existingBook.title,
      description:
        lang === 'ru'
          ? existingBook.description
          : translations[lang]?.description || existingBook.description,
    };

    if (userId) {
      const bookListItem = await this.prisma.bookListItem.findUnique({
        where: { userId_bookId: { userId, bookId: id } },
      });
      return { ...translatedBook, bookListItem };
    }

    return translatedBook;
  }

  async getBooks(getBooksData: GetBooksWithTranslationType): Promise<Book[]> {
    const {
      page,
      pageSize,
      sortField,
      sortOrder,
      genreIds,
      themeIds,
      lang = 'ru',
    } = getBooksData;

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    let orderBy: Prisma.BookOrderByWithRelationInput = {
      visitCount: 'desc',
    };

    if (sortField && sortOrder) {
      orderBy = { [sortField]: sortOrder };
    }

    const books = await this.prisma.book.findMany({
      skip,
      take,
      orderBy,
      where: {
        AND: [
          genreIds ? { genres: { some: { id: { in: genreIds } } } } : undefined,
          themeIds ? { themes: { some: { id: { in: themeIds } } } } : undefined,
        ],
      },
    });

    return books.map((book) => ({
      ...book,
      title:
        lang === 'ru'
          ? book.title
          : (book.translations || {})[lang]?.title || book.title,
      description:
        lang === 'ru'
          ? book.description
          : (book.translations || {})[lang]?.description || book.description,
    }));
  }

  async getAllBooks(): Promise<Book[]> {
    return this.prisma.book.findMany({
      include: {
        genres: true,
        themes: true,
        authors: true,
      },
    });
  }

  async createBook(createBookData: CreateBookType): Promise<Book> {
    const {
      title,
      description,
      poster,
      authors_ids,
      themes_ids,
      release,
      genres_ids,
      franchise_ids,
      cast,
      status,
      readingHoursCount,
      ageRating,
      links,
      translations,
    } = createBookData;

    let posterPath = '';
    if (poster) {
      posterPath = await this.fileUtil.saveFile({
        file: poster,
        filename: `${title}_${Date.now()}`,
        folder: 'book_posters',
      });
    }

    const book = await this.prisma.book.create({
      data: {
        title: title,
        description: description,
        posterPath: posterPath,
        release: release,
        status: status,
        readingHoursCount: readingHoursCount,
        ageRating: ageRating,
        links: links,
        translations: translations,
        authors: {
          connect: authors_ids.map((id) => ({ id })),
        },
        themes: {
          connect: themes_ids.map((id) => ({ id })),
        },
        genres: {
          connect: genres_ids.map((id) => ({ id })),
        },
      },
    });

    await this.franchiseService.addToFranchises({
      franchiseIds: franchise_ids,
      contentId: book.id,
      genreType: 'book',
    });

    if (cast && cast.length > 0) {
      const updatedCast = cast.map((c) => ({ ...c, contentId: book.id }));
      await this.castService.createCastByArray(updatedCast);
    }

    return book;
  }

  async updateBook(updateBookData: UpdateBookType): Promise<Book> {
    const {
      id,
      title,
      description,
      poster,
      authors_ids,
      themes_ids,
      release,
      genres_ids,
      franchise_ids,
      cast,
      status,
      readingHoursCount,
      ageRating,
      links,
      translations,
    } = updateBookData;

    const existingBook = await this.prisma.book.findUnique({ where: { id } });
    if (!existingBook) {
      throw new Error('Book not found');
    }

    let posterPath = existingBook.posterPath;
    if (poster) {
      posterPath = await this.fileUtil.updateFile(
        poster,
        existingBook.posterPath,
        `${title}_${Date.now()}`,
        'book_posters',
      );
    }

    const updateData = createUpdateData({
      title,
      description,
      release,
      status,
      readingHoursCount,
      ageRating,
      links,
      posterPath,
      translations,
      authors: authors_ids,
      themes: themes_ids,
      genres: genres_ids,
      BookFranchise: franchise_ids,
    });

    const book = await this.prisma.book.update({
      where: { id },
      data: updateData,
    });

    if (cast && cast.length > 0) {
      await this.castService.updateCasts(cast);
    }

    return book;
  }

  async deleteBook(id: number): Promise<Book> {
    return this.prisma.book.delete({ where: { id } });
  }
}
