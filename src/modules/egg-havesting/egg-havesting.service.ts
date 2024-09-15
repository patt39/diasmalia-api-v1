import { Injectable } from '@nestjs/common';
import { EggHavesting, Prisma } from '@prisma/client';
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
  CreateEggHavestingsOptions,
  EggHarvestingsSelect,
  GetEggHavestingsSelections,
  GetOneEggHavestingSelections,
  UpdateEggHavestingsOptions,
  UpdateEggHavestingsSelections,
} from './egg-havesting.type';

@Injectable()
export class EggHavestingsService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(
    selections: GetEggHavestingsSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhere = {} as Prisma.EggHavestingWhereInput;
    const { search, periode, animalTypeId, organizationId, pagination } =
      selections;

    if (search) {
      Object.assign(prismaWhere, {
        OR: [{ animal: { code: { contains: search, mode: 'insensitive' } } }],
      });
    }

    if (animalTypeId) {
      Object.assign(prismaWhere, { animalTypeId });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    if (periode) {
      Object.assign(prismaWhere, {
        createdAt: {
          gte: substrateDaysToTimeNowUtcDate(Number(periode)),
          lte: dateTimeNowUtc(),
        },
      });
    }

    const eggHavestings = await this.client.eggHavesting.findMany({
      where: { ...prismaWhere, deletedAt: null },
      take: pagination.take,
      skip: pagination.skip,
      select: EggHarvestingsSelect,
      orderBy: pagination.orderBy,
    });

    const rowCount = await this.client.eggHavesting.count({
      where: { ...prismaWhere, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      value: eggHavestings,
    });
  }

  async findAllEggHarvestingsAnimalAnalytics(
    selections: GetEggHavestingsSelections,
  ) {
    const prismaWhere = {} as Prisma.EggHavestingWhereInput;
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

    const groupEggHarvestingsAnalytics = await this.client.eggHavesting.groupBy(
      {
        by: ['createdAt', 'organizationId', 'animalTypeId'],
        where: { ...prismaWhere, deletedAt: null },
        _sum: {
          quantity: true,
        },
        _count: true,
      },
    );

    const eggHarvestingAnalytics = groupCountByDateAndReturnArray({
      data: groupEggHarvestingsAnalytics,
      year: year,
      month: months,
    });

    return eggHarvestingAnalytics;
  }

  /** Find one egg-havesting in database. */
  async findOneBy(selections: GetOneEggHavestingSelections) {
    const prismaWhere = {} as Prisma.EggHavestingWhereInput;
    const { eggHarvestingId, animalId, animalTypeId, organizationId } =
      selections;

    if (eggHarvestingId) {
      Object.assign(prismaWhere, { id: eggHarvestingId });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    if (animalId) {
      Object.assign(prismaWhere, { animalId });
    }

    if (animalTypeId) {
      Object.assign(prismaWhere, { animalTypeId });
    }

    const eggHavesting = await this.client.eggHavesting.findFirst({
      where: { ...prismaWhere, deletedAt: null },
      select: EggHarvestingsSelect,
    });

    return eggHavesting;
  }

  /** Create one egg-havesting in database. */
  async createOne(options: CreateEggHavestingsOptions): Promise<EggHavesting> {
    const {
      size,
      quantity,
      animalId,
      animalTypeId,
      organizationId,
      userCreatedId,
    } = options;

    const egghavesting = this.client.eggHavesting.create({
      data: {
        size,
        quantity,
        animalId,
        animalTypeId,
        organizationId,
        userCreatedId,
      },
    });

    return egghavesting;
  }

  /** Update one egg-havesting in database. */
  async updateOne(
    selections: UpdateEggHavestingsSelections,
    options: UpdateEggHavestingsOptions,
  ): Promise<EggHavesting> {
    const { eggHarvestingId } = selections;
    const { size, quantity, animalId, userCreatedId, deletedAt } = options;

    const eggHarvesting = this.client.eggHavesting.update({
      where: { id: eggHarvestingId },
      data: {
        size,
        quantity,
        animalId,
        deletedAt,
        userCreatedId,
      },
    });

    return eggHarvesting;
  }
}
