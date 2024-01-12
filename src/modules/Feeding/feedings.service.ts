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

  /** Find one Feeding from database. */
  async findOneBy(selections: GetOneFeedingSelections) {
    const { feedingId } = selections;
    const feeding = await this.client.feeding.findUnique({
      select: FeedingSelect,
      where: {
        id: feedingId,
      },
    });

    return feeding;
  }

  /** Create one Feeding in database. */
  async createOne(options: CreateFeedingsOptions): Promise<Feeding> {
    const {
      date,
      quantity,
      type,
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
        type,
        productionPhase,
        animalId,
        organizationId,
        userCreatedId,
        note,
      },
    });

    return feeding;
  }

  /** Update one Death in the database. */
  async updateOne(
    selections: UpdateFeedingsSelections,
    options: UpdateFeedingsOptions,
  ): Promise<Feeding> {
    const { feedingId } = selections;
    const {
      date,
      quantity,
      type,
      productionPhase,
      animalId,
      organizationId,
      userCreatedId,
      note,
      deletedAt,
    } = options;

    const feeding = this.client.feeding.update({
      where: {
        id: feedingId,
      },
      data: {
        date,
        quantity,
        type,
        productionPhase,
        animalId,
        organizationId,
        userCreatedId,
        note,
        deletedAt,
      },
    });

    return feeding;
  }
}
