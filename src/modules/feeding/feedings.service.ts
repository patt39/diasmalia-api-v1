import { Injectable } from '@nestjs/common';
import {
  CreateFeedingsOptions,
  GetFeedingsSelections,
  GetOneFeedingSelections,
  UpdateFeedingsOptions,
  UpdateFeedingsSelections,
  FeedingSelect,
} from './feedings.type';
import { DatabaseService } from '../../app/database/database.service';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import { Prisma, Feeding } from '@prisma/client';

@Injectable()
export class FeedingsService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(
    selections: GetFeedingsSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhere = {} as Prisma.FeedingWhereInput;
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

    const feeding = await this.client.feeding.findMany({
      where: { ...prismaWhere, deletedAt: null },
      take: pagination.take,
      skip: pagination.skip,
      select: FeedingSelect,
      orderBy: pagination.orderBy,
    });

    const rowCount = await this.client.feeding.count({
      where: { ...prismaWhere, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      value: feeding,
    });
  }

  /** Find one feeding in database. */
  async findOneBy(selections: GetOneFeedingSelections) {
    const prismaWhere = {} as Prisma.FeedingWhereInput;
    const { feedingId, organizationId } = selections;

    if (feedingId) {
      Object.assign(prismaWhere, { id: feedingId });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    const feeding = await this.client.feeding.findFirst({
      where: { ...prismaWhere, deletedAt: null },
      select: FeedingSelect,
    });

    return feeding;
  }

  /** Create one feeding in database. */
  async createOne(options: CreateFeedingsOptions): Promise<Feeding> {
    const {
      date,
      quantity,
      feedTypeId,
      animalId,
      productionPhase,
      organizationId,
      userCreatedId,
      note,
    } = options;

    const feeding = this.client.feeding.create({
      data: {
        date,
        quantity,
        feedTypeId,
        productionPhase,
        animalId,
        organizationId,
        userCreatedId,
        note,
      },
    });

    return feeding;
  }

  /** Update one feeding in database. */
  async updateOne(
    selections: UpdateFeedingsSelections,
    options: UpdateFeedingsOptions,
  ): Promise<Feeding> {
    const { feedingId } = selections;
    const {
      date,
      note,
      quantity,
      feedTypeId,
      productionPhase,
      organizationId,
      animalId,
      userCreatedId,
      deletedAt,
    } = options;

    const feeding = this.client.feeding.update({
      where: {
        id: feedingId,
      },
      data: {
        date,
        note,
        quantity,
        feedTypeId,
        productionPhase,
        animalId,
        organizationId,
        userCreatedId,
        deletedAt,
      },
    });

    return feeding;
  }
}
