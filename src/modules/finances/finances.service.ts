import { Injectable } from '@nestjs/common';
import { Finance, Prisma } from '@prisma/client';
import { DatabaseService } from '../../app/database/database.service';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
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
    const { search, organizationId, pagination } = selections;

    if (search) {
      Object.assign(prismaWhere, {
        OR: [
          {
            date: { contains: search, mode: 'insensitive' },
          },
        ],
      });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    const finances = await this.client.finance.findMany({
      where: { ...prismaWhere, deletedAt: null },
      take: pagination.take,
      skip: pagination.skip,
      select: FinancesSelect,
      orderBy: pagination.orderBy,
    });

    const rowCount = await this.client.finance.count({
      where: { ...prismaWhere, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      value: finances,
    });
  }

  /** Find one finance from database. */
  async findOneBy(selections: GetOneFinanceSelections) {
    const { financeId } = selections;
    const finance = await this.client.finance.findUnique({
      select: FinancesSelect,
      where: {
        id: financeId,
      },
    });

    return finance;
  }

  /** Create one finance in database. */
  async createOne(options: CreateFinanceOptions): Promise<Finance> {
    const {
      date,
      note,
      type,
      amount,
      accountId,
      details,
      organizationId,
      userCreatedId,
    } = options;

    const financialMgt = this.client.finance.create({
      data: {
        date,
        note,
        type,
        amount,
        accountId,
        details,
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
    const {
      date,
      note,
      type,
      amount,
      details,
      accountId,
      organizationId,
      userCreatedId,
      deletedAt,
    } = options;

    const finance = this.client.finance.update({
      where: {
        id: financeId,
      },
      data: {
        date,
        note,
        type,
        amount,
        details,
        accountId,
        organizationId,
        userCreatedId,
        deletedAt,
      },
    });

    return finance;
  }
}
