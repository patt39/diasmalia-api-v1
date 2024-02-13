import { Injectable } from '@nestjs/common';
import { FeedType, Prisma } from '@prisma/client';
import { DatabaseService } from '../../app/database/database.service';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import {
  CreateFeedTypesOptions,
  FeedTypeSelect,
  GetFeedTypesSelections,
  GetOneFeedTypeSelections,
  UpdateFeedTypesOptions,
  UpdateFeedTypesSelections,
} from './feedType.type';

@Injectable()
export class FeedTypeService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(
    selections: GetFeedTypesSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhere = {} as Prisma.FeedTypeWhereInput;
    const { search, organizationId, pagination } = selections;

    if (search) {
      Object.assign(prismaWhere, {
        OR: [
          {
            code: { contains: search, mode: 'insensitive' },
          },
        ],
      });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    const feedType = await this.client.feedType.findMany({
      where: { ...prismaWhere, deletedAt: null },
      take: pagination.take,
      skip: pagination.skip,
      select: FeedTypeSelect,
      orderBy: pagination.orderBy,
    });

    const rowCount = await this.client.feedType.count({
      where: { ...prismaWhere, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      value: feedType,
    });
  }

  /** Find one feedType in database. */
  async findOneBy(selections: GetOneFeedTypeSelections) {
    const prismaWhere = {} as Prisma.FeedTypeWhereInput;
    const { feedTypeId, organizationId } = selections;

    if (feedTypeId) {
      Object.assign(prismaWhere, { id: feedTypeId });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    const feedType = await this.client.feedType.findFirst({
      where: { ...prismaWhere, deletedAt: null },
      select: FeedTypeSelect,
    });

    return feedType;
  }

  /** Create one feedType in database. */
  async createOne(options: CreateFeedTypesOptions): Promise<FeedType> {
    const { name, organizationId, userCreatedId } = options;

    const feedType = this.client.feedType.create({
      data: {
        name,
        organizationId,
        userCreatedId,
      },
    });

    return feedType;
  }

  /** Update one feedType in database. */
  async updateOne(
    selections: UpdateFeedTypesSelections,
    options: UpdateFeedTypesOptions,
  ): Promise<FeedType> {
    const { feedTypeId } = selections;
    const { name, organizationId, userCreatedId, deletedAt } = options;

    const feedType = this.client.feedType.update({
      where: {
        id: feedTypeId,
      },
      data: {
        name,
        organizationId,
        userCreatedId,
        deletedAt,
      },
    });

    return feedType;
  }
}
