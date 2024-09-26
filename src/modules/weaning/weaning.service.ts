import { Injectable } from '@nestjs/common';
import { Prisma, Weaning } from '@prisma/client';
import {
  dateTimeNowUtc,
  lastDayMonth,
  substrateDaysToTimeNowUtcDate,
} from 'src/app/utils/commons';
import { DatabaseService } from '../../app/database/database.service';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import { groupCountWeaningAnalyticsByDateAndReturnArray } from './weaning.analytics.utils';
import {
  CreateWeaningsOptions,
  GetOneWeaningSelections,
  GetWeaningsSelections,
  UpdateWeaningsOptions,
  UpdateWeaningsSelections,
  WeaningSelect,
} from './weaning.type';

@Injectable()
export class WeaningsService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(
    selections: GetWeaningsSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhere = {} as Prisma.WeaningWhereInput;
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

    const weanings = await this.client.weaning.findMany({
      where: { ...prismaWhere, deletedAt: null },
      take: pagination.take,
      skip: pagination.skip,
      select: WeaningSelect,
      orderBy: pagination.orderBy,
    });

    const rowCount = await this.client.weaning.count({
      where: { ...prismaWhere, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      value: weanings,
    });
  }

  /** Get weanings analytics. */
  async getWeaninsAnalytics(selections: GetWeaningsSelections) {
    const prismaWhere = {} as Prisma.WeaningWhereInput;
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

    const groupWeaningsAnalytics = await this.client.weaning.groupBy({
      // farrowing: {
      //   _sum: {
      //     litter: true,
      //   }
      // },

      by: ['createdAt', 'organizationId', 'animalTypeId'],
      where: { ...prismaWhere, deletedAt: null },
      _sum: {
        litter: true,
      },

      _count: true,
    });

    const weaningsAnalytics = groupCountWeaningAnalyticsByDateAndReturnArray({
      data: groupWeaningsAnalytics,
      year: year,
      month: months,
    });

    return weaningsAnalytics;
  }

  /** Find one weaning in database. */
  async findOneBy(selections: GetOneWeaningSelections) {
    const prismaWhere = {} as Prisma.WeaningWhereInput;
    const { weaningId, animalId, organizationId } = selections;

    if (weaningId) {
      Object.assign(prismaWhere, { id: weaningId });
    }

    if (animalId) {
      Object.assign(prismaWhere, { animalId });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    const weaning = await this.client.weaning.findFirst({
      where: { ...prismaWhere, deletedAt: null },
      select: WeaningSelect,
    });

    return weaning;
  }

  /** Create one weaning in database. */
  async createOne(options: CreateWeaningsOptions): Promise<Weaning> {
    const {
      litter,
      animalId,
      farrowingId,
      animalTypeId,
      organizationId,
      userCreatedId,
    } = options;

    const weaning = this.client.weaning.create({
      data: {
        litter,
        animalId,
        farrowingId,
        animalTypeId,
        organizationId,
        userCreatedId,
      },
    });

    return weaning;
  }

  /** Update one weaning in database. */
  async updateOne(
    selections: UpdateWeaningsSelections,
    options: UpdateWeaningsOptions,
  ): Promise<Weaning> {
    const { weaningId } = selections;
    const { litter, deletedAt } = options;

    const weaning = this.client.weaning.update({
      where: { id: weaningId },
      data: {
        litter,
        deletedAt,
      },
    });

    return weaning;
  }
}
