import { Injectable } from '@nestjs/common';
import { Finance, Prisma } from '@prisma/client';
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
import { groupCountRevenueByDateAndReturnArray } from './finance.utils';
import {
  CreateFinanceOptions,
  FinancesSelect,
  GetFinancesSelections,
  GetOneFinanceSelections,
  UpdateFinancesOptions,
  UpdateFinancesSelections,
} from './finances.type';

@Injectable()
export class FinancesService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(
    selections: GetFinancesSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhere = {} as Prisma.FinanceWhereInput;
    const {
      search,
      type,
      periode,
      organizationId,
      pagination,
      animalId,
      animalTypeId,
    } = selections;

    if (search) {
      Object.assign(prismaWhere, {
        OR: [{ detail: { contains: search, mode: 'insensitive' } }],
      });
    }

    if (animalId) {
      Object.assign(prismaWhere, { animalId });
    }

    if (animalTypeId) {
      Object.assign(prismaWhere, { animalTypeId });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    if (type) {
      Object.assign(prismaWhere, { type });
    }

    if (periode) {
      Object.assign(prismaWhere, {
        createdAt: {
          gte: substrateDaysToTimeNowUtcDate(Number(periode)),
          lte: dateTimeNowUtc(),
        },
      });
    }

    const finances = await this.client.finance.findMany({
      where: { ...prismaWhere, deletedAt: null },
      take: pagination.take,
      skip: pagination.skip,
      select: FinancesSelect,
      orderBy: pagination.orderBy,
    });

    const revenue = await this.client.finance.aggregate({
      where: {
        deletedAt: null,
        ...prismaWhere,
        organizationId: organizationId,
      },
      _sum: {
        amount: true,
      },
    });

    const rowCount = await this.client.finance.count({
      where: { ...prismaWhere, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      revenue: revenue?._sum?.amount,
      value: finances,
    });
  }

  /** Get financial analytics. */
  async getFinanceAnalytics(selections: GetFinancesSelections) {
    const prismaWhere = {} as Prisma.FinanceWhereInput;
    const { periode, months, year, organizationId } = selections;

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

    const groupFinanceAnalytics = await this.client.finance.groupBy({
      by: ['createdAt', 'organizationId'],
      where: {
        ...prismaWhere,
        deletedAt: null,
      },
      _sum: {
        amount: true,
      },
      _count: true,
    });

    const financeAnalytics = groupCountRevenueByDateAndReturnArray({
      data: groupFinanceAnalytics,
      year: year,
      month: months,
    });

    return financeAnalytics;
  }

  /** Find one finance from database. */
  async findOneBy(selections: GetOneFinanceSelections) {
    const prismaWhere = {} as Prisma.FinanceWhereInput;
    const { financeId, slug, organizationId } = selections;

    if (financeId) {
      Object.assign(prismaWhere, { id: financeId });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    if (slug) {
      Object.assign(prismaWhere, { slug });
    }

    const finance = await this.client.finance.findFirst({
      where: { ...prismaWhere, deletedAt: null },
      select: FinancesSelect,
    });

    return finance;
  }

  /** Create one finance in database. */
  async createOne(options: CreateFinanceOptions): Promise<Finance> {
    const {
      type,
      amount,
      detail,
      animalId,
      animalTypeId,
      organizationId,
      userCreatedId,
    } = options;

    const financialMgt = this.client.finance.create({
      data: {
        type,
        detail,
        amount,
        animalId,
        animalTypeId,
        organizationId,
        userCreatedId,
      },
    });

    return financialMgt;
  }

  /** Update one finance in database. */
  async updateOne(
    selections: UpdateFinancesSelections,
    options: UpdateFinancesOptions,
  ): Promise<Finance> {
    const { financeId } = selections;
    const { type, amount, detail, animalId, userCreatedId, deletedAt } =
      options;

    const finance = this.client.finance.update({
      where: { id: financeId },
      data: {
        type,
        amount,
        detail,
        animalId,
        userCreatedId,
        deletedAt,
      },
    });

    return finance;
  }
}
