import { Injectable } from '@nestjs/common';
import { Feeding, Prisma } from '@prisma/client';
import {
  dateTimeNowUtc,
  substrateDaysToTimeNowUtcDate,
} from 'src/app/utils/commons';
import { DatabaseService } from '../../app/database/database.service';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import {
  CreateFeedingsOptions,
  FeedingSelect,
  GetFeedingsSelections,
  GetOneFeedingSelections,
  UpdateFeedingsOptions,
  UpdateFeedingsSelections,
} from './feedings.type';

@Injectable()
export class FeedingsService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(
    selections: GetFeedingsSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhere = {} as Prisma.FeedingWhereInput;
    const { search, periode, organizationId, animalTypeId, pagination } =
      selections;

    if (search) {
      Object.assign(prismaWhere, {
        OR: [{ animal: { code: { contains: search, mode: 'insensitive' } } }],
      });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    if (animalTypeId) {
      Object.assign(prismaWhere, { animalTypeId });
    }

    if (periode) {
      Object.assign(prismaWhere, {
        createdAt: {
          gte: substrateDaysToTimeNowUtcDate(Number(periode)),
          lte: dateTimeNowUtc(),
        },
      });
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
    const { feedingId, animalTypeId, organizationId } = selections;

    if (feedingId) {
      Object.assign(prismaWhere, { id: feedingId });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    if (animalTypeId) {
      Object.assign(prismaWhere, { animalTypeId });
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
      quantity,
      feedType,
      animalId,
      animalTypeId,
      productionPhase,
      organizationId,
      userCreatedId,
    } = options;

    const feeding = this.client.feeding.create({
      data: {
        quantity,
        feedType,
        animalId,
        animalTypeId,
        productionPhase,
        organizationId,
        userCreatedId,
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
    const { quantity, feedType, animalId, userCreatedId, deletedAt } = options;

    const feeding = this.client.feeding.update({
      where: { id: feedingId },
      data: {
        quantity,
        feedType,
        animalId,
        userCreatedId,
        deletedAt,
      },
    });

    return feeding;
  }
}
