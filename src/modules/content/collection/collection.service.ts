import {Injectable} from "@nestjs/common";
import {PrismaService} from "../../../../prisma/prisma.service";
import {FileUtil} from "../../../common/utils/file.util";
import {
  Collection,
  CollectionBook,
  CollectionGame,
  CollectionMovie,
  CollectionVisibility,
  GenreType
} from "@prisma/client";
import {CollectionItem, CollectionType, CollectionUpdateType, CollectionWithItemsType} from "./types/collection.type";
import {createUpdateData} from "../../../common/utils/updateData.util";

@Injectable()
export class CollectionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileUtil: FileUtil,
  ) {}
  async getCollections(): Promise<Collection[]> {
    return this.prisma.collection.findMany({
      where: { visibility: 'public' },
    });
  }

  async getCollection(id: number): Promise<CollectionWithItemsType> {
    const collection = await this.prisma.collection.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            username: true,
            profileName: true,
          },
        },
        books: {
          include: {
            book: {
              select: {
                title: true,
                posterPath: true,
              },
            },
          },
        },
        movies: {
          include: {
            movie: {
              select: {
                title: true,
                posterPath: true,
              },
            },
          },
        },
        games: {
          include: {
            game: {
              select: {
                title: true,
                posterPath: true,
              },
            },
          },
        },
      },
    });

    this.validate(collection);

    return {
      ...collection,
      books: collection.books.map((cb) => cb.book),
      movies: collection.movies.map((cm) => cm.movie),
      games: collection.games.map((cg) => cg.game),
    };
  }

  async createCollection(data: CollectionType): Promise<Collection> {
    const { userId, name, description, poster } = data;

    let posterPath = '';
    if (poster) {
      posterPath = await this.fileUtil.saveFile({
        file: poster,
        filename: `${name}_${Date.now()}`,
        folder: 'collections_posters',
      });
    }

    return this.prisma.collection.create({
      data: {
        userId,
        name,
        description,
        posterPath,
      },
    });
  }

  async updateCollection(
    updateData: CollectionUpdateType,
  ): Promise<Collection> {
    const { collectionId, userId, poster, name, description, visibility } =
      updateData;

    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
    });

    this.validate(collection, userId);

    let posterPath = '';
    if (poster) {
      posterPath = await this.fileUtil.updateFile(
        poster,
        collection?.posterPath,
        `${name}_${Date.now()}`,
        'collections_posters',
      );
    }

    const data = createUpdateData({
      posterPath,
      name,
      description,
      visibility,
    });

    return this.prisma.collection.update({
      where: { id: collectionId },
      data,
    });
  }

  async getCollectionsByUserId(userId: number): Promise<Collection[]> {
    return this.prisma.collection.findMany({
      where: { userId },
    });
  }

  async deleteCollection(
    data: Omit<CollectionItem, 'genreType' | 'contentId'>,
  ): Promise<Collection> {
    const { collectionId, userId } = data;

    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
    });

    this.validate(collection, userId);

    return this.prisma.collection.delete({ where: { id: collectionId } });
  }

  async addItemToCollection(
    addItemToCollectionData: CollectionItem,
  ): Promise<CollectionBook | CollectionGame | CollectionMovie> {
    const { userId, collectionId, genreType, contentId } =
      addItemToCollectionData;

    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
    });

    this.validate(collection, userId);

    const modelName = this.getModelName(genreType);
    const data = this.createCollectionItemData(
      genreType,
      collectionId,
      contentId,
    );

    return this.prisma[modelName].create({ data });
  }

  async deleteItemFromCollection(
    data: CollectionItem,
  ): Promise<CollectionBook | CollectionGame | CollectionMovie> {
    const { collectionId, userId, genreType, contentId } = data;

    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
    });

    this.validate(collection, userId);

    const modelName = this.getModelName(genreType);
    const where = this.createCollectionItemData(
      genreType,
      collectionId,
      contentId,
    );

    return this.prisma[modelName].delete({ where });
  }

  private getModelName(genreType: GenreType): string {
    switch (genreType) {
      case 'book':
        return 'collectionBook';
      case 'game':
        return 'collectionGame';
      case 'movie':
        return 'collectionMovie';
      default:
        throw new Error(`Unknown content type: ${genreType}`);
    }
  }

  private createCollectionItemData(
    genreType: GenreType,
    collectionId: number,
    contentId: number,
  ): any {
    const contentIdField = `${genreType.toLowerCase()}Id`;
    return {
      collectionId,
      [contentIdField]: contentId,
    };
  }

  private validate(collection: Collection, userId?: number) {
    if (!collection) {
      throw new Error('Collection not found');
    }

    if (
      collection.userId !== userId &&
      collection.visibility == CollectionVisibility.private
    ) {
      throw new Error('User is not the owner of the collection');
    }
  }
}
