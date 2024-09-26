import { Injectable } from '@nestjs/common';
import { Death, Prisma } from '@prisma/client';
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
import { groupCountDeathAnalysisByDateAndReturnArray } from './deaths.analytics.utils';
import {
  CreateDeathsOptions,
  DeathSelect,
  GetDeathsSelections,
  GetOneDeathSelections,
  UpdateDeathsOptions,
  UpdateDeathsSelections,
} from './deaths.type';

@Injectable()
export class DeathsService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(
    selections: GetDeathsSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhere = {} as Prisma.DeathWhereInput;
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

    const deaths = await this.client.death.findMany({
      where: { ...prismaWhere, deletedAt: null },
      take: pagination.take,
      skip: pagination.skip,
      select: DeathSelect,
      orderBy: pagination.orderBy,
    });

    const rowCount = await this.client.death.count({
      where: { ...prismaWhere, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      value: deaths,
    });
  }

  /** Get deaths analytics. */
  async getAnimalDeathAnalytics(selections: GetDeathsSelections) {
    const prismaWhere = {} as Prisma.DeathWhereInput;
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

    const groupDeathsAnalytics = await this.client.death.groupBy({
      by: ['createdAt', 'organizationId', 'animalTypeId'],
      where: { ...prismaWhere, deletedAt: null },
      _sum: {
        number: true,
      },
      _count: true,
    });

    const deathsAnalytics = groupCountDeathAnalysisByDateAndReturnArray({
      data: groupDeathsAnalytics,
      year: year,
      month: months,
    });

    return deathsAnalytics;
  }

  /** Find one death in database. */
  async findOneBy(selections: GetOneDeathSelections) {
    const prismaWhere = {} as Prisma.DeathWhereInput;
    const { deathId, animalTypeId, organizationId, animalId } = selections;

    if (deathId) {
      Object.assign(prismaWhere, { id: deathId });
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

    const death = await this.client.death.findFirst({
      where: { ...prismaWhere, deletedAt: null },
      select: DeathSelect,
    });

    return death;
  }

  /** Create one death in database. */
  async createOne(options: CreateDeathsOptions): Promise<Death> {
    const {
      note,
      male,
      number,
      female,
      animalId,
      animalTypeId,
      organizationId,
      userCreatedId,
    } = options;

    const death = this.client.death.create({
      data: {
        note,
        male,
        number,
        female,
        animalId,
        animalTypeId,
        organizationId,
        userCreatedId,
      },
    });

    return death;
  }

  /** Update one Death in database. */
  async updateOne(
    selections: UpdateDeathsSelections,
    options: UpdateDeathsOptions,
  ): Promise<Death> {
    const { deathId } = selections;
    const { note, male, number, female, userCreatedId, deletedAt } = options;

    const death = this.client.death.update({
      where: { id: deathId },
      data: {
        note,
        male,
        number,
        female,
        userCreatedId,
        deletedAt,
      },
    });

    return death;
  }
}
