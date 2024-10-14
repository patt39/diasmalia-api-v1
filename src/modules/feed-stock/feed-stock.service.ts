import { Injectable } from '@nestjs/common';
import { FeedStock, Prisma } from '@prisma/client';
import { DatabaseService } from '../../app/database/database.service';
import {
  withPagination,
  WithPaginationResponse,
} from '../../app/utils/pagination';
import {
  CreateFeedStocksOptions,
  FeedStockSelect,
  GetFeedStockSelections,
  GetOneFeedStockSelections,
  UpdateFeedStockSelections,
  UpdateFeedStocksOptions,
} from './feed-stock.type';

@Injectable()
export class FeedStocksService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(
    selections: GetFeedStockSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhere = {} as Prisma.FeedStockWhereInput;
    const { organizationId, animalTypeId, animalTypeName, pagination } =
      selections;

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    if (animalTypeId) {
      Object.assign(prismaWhere, { animalTypeId });
    }

    if (animalTypeName) {
      Object.assign(prismaWhere, { animalTypeName });
    }

    const feedStock = await this.client.feedStock.findMany({
      where: { ...prismaWhere, deletedAt: null },
      take: pagination.take,
      skip: pagination.skip,
      select: FeedStockSelect,
      orderBy: pagination.orderBy,
    });

    const rowCount = await this.client.feedStock.count({
      where: { ...prismaWhere, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      value: feedStock,
    });
  }

  /** Find one feed stock in database. */
  async findOneBy(selections: GetOneFeedStockSelections) {
    const prismaWhere = {} as Prisma.FeedStockWhereInput;
    const { feedStockId, animalTypeId, feedCategory, organizationId } =
      selections;

    if (feedStockId) {
      Object.assign(prismaWhere, { id: feedStockId });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    if (feedCategory) {
      Object.assign(prismaWhere, { feedCategory });
    }

    if (animalTypeId) {
      Object.assign(prismaWhere, { animalTypeId });
    }

    const feedStock = await this.client.feedStock.findFirst({
      where: { ...prismaWhere, deletedAt: null },
      select: FeedStockSelect,
    });

    return feedStock;
  }

  /** Create one feed stock in database. */
  async createOne(options: CreateFeedStocksOptions): Promise<FeedStock> {
    const {
      weight,
      number,
      bagWeight,
      composition,
      animalTypeId,
      feedCategory,
      animalTypeName,
      organizationId,
      userCreatedId,
    } = options;

    const feedStock = this.client.feedStock.create({
      data: {
        weight,
        number,
        bagWeight,
        composition,
        feedCategory,
        animalTypeId,
        animalTypeName,
        organizationId,
        userCreatedId,
      },
    });

    return feedStock;
  }

  /** Update one feed stock in database. */
  async updateOne(
    selections: UpdateFeedStockSelections,
    options: UpdateFeedStocksOptions,
  ): Promise<FeedStock> {
    const { feedStockId } = selections;
    const {
      weight,
      number,
      bagWeight,
      composition,
      userCreatedId,
      animalTypeId,
      feedCategory,
      deletedAt,
    } = options;

    const feedStock = this.client.feedStock.update({
      where: { id: feedStockId },
      data: {
        weight,
        number,
        bagWeight,
        composition,
        animalTypeId,
        feedCategory,
        userCreatedId,
        deletedAt,
      },
    });

    return feedStock;
  }
}
