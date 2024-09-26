import { Injectable } from '@nestjs/common';
import { Incubation, Prisma } from '@prisma/client';
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
import { groupCountIncubationAnalyticsByDateAndReturnArray } from './incubation.analytics.utils';
import {
  CreateIncubationsOptions,
  GetOneIncubationSelections,
  IncubationsSelect,
  IncubationsSelections,
  UpdateIncubationsOptions,
  UpdateIncubationsSelections,
} from './incubation.type';

@Injectable()
export class IncubationsService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(
    selections: IncubationsSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhere = {} as Prisma.IncubationWhereInput;
    const { search, periode, animalTypeId, organizationId, pagination } =
      selections;

    if (search) {
      Object.assign(prismaWhere, {
        OR: [{ date: { contains: search, mode: 'insensitive' } }],
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

    const incubations = await this.client.incubation.findMany({
      where: { ...prismaWhere, deletedAt: null },
      take: pagination.take,
      skip: pagination.skip,
      select: IncubationsSelect,
      orderBy: pagination.orderBy,
    });

    const rowCount = await this.client.incubation.count({
      where: { ...prismaWhere, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      value: incubations,
    });
  }

  /** Find one incubation in database. */
  async findOneBy(selections: GetOneIncubationSelections) {
    const prismaWhere = {} as Prisma.IncubationWhereInput;
    const { incubationId, animalId, animalTypeId, organizationId } = selections;

    if (incubationId) {
      Object.assign(prismaWhere, { id: incubationId });
    }

    if (animalId) {
      Object.assign(prismaWhere, { animalId });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    if (animalTypeId) {
      Object.assign(prismaWhere, { animalTypeId });
    }

    const incubation = await this.client.incubation.findFirst({
      where: { ...prismaWhere, deletedAt: null },
      select: IncubationsSelect,
    });

    return incubation;
  }

  /** Get incubation analytics. */
  async getAnimalIncubationsAnalytics(selections: IncubationsSelections) {
    const prismaWhere = {} as Prisma.IncubationWhereInput;
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

    const groupIncubationsAnalytics = await this.client.incubation.groupBy({
      by: ['createdAt', 'organizationId', 'animalTypeId'],
      where: { ...prismaWhere, deletedAt: null },
      _sum: {
        quantityEnd: true,
        quantityStart: true,
      },
      _count: true,
    });

    const incubationAnalytics =
      groupCountIncubationAnalyticsByDateAndReturnArray({
        data: groupIncubationsAnalytics,
        year: year,
        month: months,
      });

    return incubationAnalytics;
  }

  /** Create one incubation in database. */
  async createOne(options: CreateIncubationsOptions): Promise<Incubation> {
    const {
      dueDate,
      animalId,
      quantityEnd,
      quantityStart,
      animalTypeId,
      organizationId,
      userCreatedId,
    } = options;

    const incubation = this.client.incubation.create({
      data: {
        animalId,
        dueDate,
        quantityEnd,
        quantityStart,
        animalTypeId,
        organizationId,
        userCreatedId,
      },
    });

    return incubation;
  }

  /** Update one incubation in database. */
  async updateOne(
    selections: UpdateIncubationsSelections,
    options: UpdateIncubationsOptions,
  ): Promise<Incubation> {
    const { incubationId } = selections;
    const {
      dueDate,
      animalId,
      quantityEnd,
      quantityStart,
      organizationId,
      userCreatedId,
      deletedAt,
    } = options;

    const incubation = this.client.incubation.update({
      where: { id: incubationId },
      data: {
        dueDate,
        animalId,
        quantityEnd,
        quantityStart,
        organizationId,
        userCreatedId,
        deletedAt,
      },
    });

    return incubation;
  }
}
