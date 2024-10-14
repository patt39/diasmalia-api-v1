import { Injectable } from '@nestjs/common';
import { Milking, Prisma } from '@prisma/client';
import { DatabaseService } from '../../app/database/database.service';
import {
  dateTimeNowUtc,
  lastDayMonth,
  substrateDaysToTimeNowUtcDate,
} from '../../app/utils/commons';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import { groupCountByDateAndReturnArray } from '../analytics/analytics.utils';
import {
  CreateMilkingsOptions,
  GetMilkingsSelections,
  GetOneMilkingsSelections,
  MilkingSelect,
  UpdateMilkingsOptions,
  UpdateMilkingsSelections,
} from './milkings.type';

@Injectable()
export class MilkingsService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(
    selections: GetMilkingsSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhere = {} as Prisma.MilkingWhereInput;
    const { search, animalTypeId, periode, organizationId, pagination } =
      selections;

    if (search) {
      Object.assign(prismaWhere, {
        OR: [{ animal: { code: { contains: search, mode: 'insensitive' } } }],
      });
    }

    if (periode) {
      Object.assign(prismaWhere, {
        createdAt: {
          gte: substrateDaysToTimeNowUtcDate(Number(periode)),
          lte: dateTimeNowUtc(),
        },
      });
    }

    if (animalTypeId) {
      Object.assign(prismaWhere, { animalTypeId });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    const milkings = await this.client.milking.findMany({
      where: {
        ...prismaWhere,
        deletedAt: null,
        animal: {
          status: 'ACTIVE',
          deletedAt: null,
        },
      },
      take: pagination.take,
      skip: pagination.skip,
      select: MilkingSelect,
      orderBy: pagination.orderBy,
    });

    const rowCount = await this.client.milking.count({
      where: { ...prismaWhere, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      value: milkings,
    });
  }

  /** Get animal milking analytics. */
  async getAnimalMilkingAnalytics(selections: GetMilkingsSelections) {
    const prismaWhere = {} as Prisma.MilkingWhereInput;
    const { animalTypeId, periode, months, year, organizationId } = selections;

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

    if (year) {
      Object.assign(prismaWhere, {
        createdAt: {
          gte: new Date(`${Number(year)}-01-01`),
          lte: new Date(`${Number(year) + 1}-01-01`),
        },
      });
      if (months) {
        Object.assign(prismaWhere, {
          createdAt: {
            gte: new Date(`${year}-${months}-01`),
            lte: lastDayMonth({
              year: Number(year),
              month: Number(months),
            }),
          },
        });
      }
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    const groupMilkingsAnalytics = await this.client.milking.groupBy({
      by: ['createdAt', 'organizationId', 'animalTypeId'],
      where: {
        ...prismaWhere,
        deletedAt: null,
        animal: { status: 'ACTIVE', deletedAt: null },
      },
      _sum: {
        quantity: true,
      },
      _count: true,
    });

    const milkingAnalytics = groupCountByDateAndReturnArray({
      data: groupMilkingsAnalytics,
      year: year,
      month: months,
    });

    return milkingAnalytics;
  }

  /** Find one milking in database. */
  async findOneBy(selections: GetOneMilkingsSelections) {
    const prismaWhere = {} as Prisma.MilkingWhereInput;
    const { milkingId, animalTypeId, organizationId } = selections;

    if (milkingId) {
      Object.assign(prismaWhere, { id: milkingId });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    if (animalTypeId) {
      Object.assign(prismaWhere, { animalTypeId });
    }

    const milking = await this.client.milking.findFirst({
      where: { ...prismaWhere, deletedAt: null },
      select: MilkingSelect,
    });

    return milking;
  }

  /** Create one milking in database. */
  async createOne(options: CreateMilkingsOptions): Promise<Milking> {
    const {
      note,
      quantity,
      animalId,
      animalTypeId,
      organizationId,
      userCreatedId,
    } = options;

    const milking = this.client.milking.create({
      data: {
        note,
        quantity,
        animalId,
        animalTypeId,
        organizationId,
        userCreatedId,
      },
    });

    return milking;
  }

  /** Update one milking in database. */
  async updateOne(
    selections: UpdateMilkingsSelections,
    options: UpdateMilkingsOptions,
  ): Promise<Milking> {
    const { milkingId } = selections;
    const { note, quantity, userCreatedId, deletedAt } = options;

    const milking = this.client.milking.update({
      where: { id: milkingId },
      data: {
        note,
        quantity,
        userCreatedId,
        deletedAt,
      },
    });

    return milking;
  }
}
