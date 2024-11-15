import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { GenreType } from '@prisma/client';
import * as tf from '@tensorflow/tfjs';
import {PrismaService} from "../../../prisma/prisma.service";

@Injectable()
export class RecommendationService implements OnModuleInit {
  private model: tf.GraphModel;

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    try {
      await this.loadModel();
    } catch (error) {
      console.error('Error loading TensorFlow model:', error);
    }
  }

  private async loadModel() {
    this.model = await tf.loadGraphModel(
      'https://www.kaggle.com/models/google/inception-v3/TfJs/classification/2',
      { fromTFHub: true },
    );
  }

  private getModelName(genreType: GenreType): string {
    switch (genreType) {
      case 'book':
        return 'Book';
      case 'movie':
        return 'Movie';
      case 'game':
        return 'Game';
      default:
        throw new Error(`Unknown content type: ${genreType}`);
    }
  }

  private getSimilarModelName(genreType: GenreType): string {
    switch (genreType) {
      case 'book':
        return 'SimilarBook';
      case 'movie':
        return 'SimilarMovie';
      case 'game':
        return 'SimilarGame';
      default:
        throw new Error(`Unknown content type: ${genreType}`);
    }
  }

  private getFieldWeights() {
    return {
      title: 0.2,
      description: 0.3,
      genres: 0.25,
      themes: 0.25,
    };
  }

  private async extractFeatures(data: any): Promise<number[]> {
    const tensor = tf.tensor(data).reshape([1, data.length]);
    const features = this.model.predict(tensor) as tf.Tensor;
    return Array.from(features.dataSync());
  }

  private findSimilarItems(
    features: number[],
    items: any[],
    fieldWeights: any,
  ) {
    return items
      .map((item) => {
        const itemFeatures = item.features;
        const distance = this.calculateWeightedDistance(
          features,
          itemFeatures,
          fieldWeights,
        );
        return { ...item, distance };
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);
  }

  private calculateWeightedDistance(
    features1: number[],
    features2: number[],
    fieldWeights: any,
  ) {
    return features1.reduce((sum, value, index) => {
      const weight = fieldWeights[index] || 1;
      return sum + weight * Math.pow(value - features2[index], 2);
    }, 0);
  }

  private async getAllItems(genreType: GenreType) {
    const modelName = this.getModelName(genreType);
    return this.prisma[modelName].findMany({
      where: {
        description: { not: '' },
        genres: { not: [] },
        themes: { not: [] },
      },
      select: {
        id: true,
        title: true,
        description: true,
        genres: true,
        themes: true,
      },
    });
  }

  private async deleteSimilarRecords(genreType: GenreType, itemId: number) {
    const similarModelName = this.getSimilarModelName(genreType);
    await this.prisma[similarModelName].deleteMany({
      where: {
        OR: [{ sourceBookId: itemId }, { targetBookId: itemId }],
      },
    });
  }

  private async createSimilarRecords(
    genreType: GenreType,
    similarRecords: any[],
  ) {
    const similarModelName = this.getSimilarModelName(genreType);
    await this.prisma[similarModelName].createMany({
      data: similarRecords,
    });
  }

  @Cron('0 0 * * 6')
  async updateBooks() {
    await this.updateSimilarItems('book');
  }

  @Cron('0 0 * * 5')
  async updateMovies() {
    await this.updateSimilarItems('movie');
  }

  @Cron('0 0 * * 4')
  async updateGames() {
    await this.updateSimilarItems('game');
  }

  async updateSimilarItems(genreType: GenreType) {
    const allItems = await this.getAllItems(genreType);
    const fieldWeights = this.getFieldWeights();

    for (const item of allItems) {
      await this.deleteSimilarRecords(genreType, item.id);

      const features = await this.extractFeatures({
        description: item.description || '',
        genres: item.genres,
        themes: item.themes,
      });

      const similarItems = this.findSimilarItems(
        features,
        allItems.filter((i) => i.id !== item.id),
        fieldWeights,
      );

      const similarRecords = similarItems.map((similarItem) => ({
        sourceBookId: item.id,
        targetBookId: similarItem.id,
      }));

      await this.createSimilarRecords(genreType, similarRecords);
    }
  }
}
