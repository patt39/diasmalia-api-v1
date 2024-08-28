import { Injectable } from '@nestjs/common';
import { Finance, Prisma } from '@prisma/client';
import { DatabaseService } from '../../app/database/database.service';
import { Slug, generateNumber } from '../../app/utils/commons/generate-random';
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
    const { search, type, organizationId, pagination } = selections;

    if (search) {
      Object.assign(prismaWhere, {
        OR: [{ detail: { contains: search, mode: 'insensitive' } }],
      });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    if (type) {
      Object.assign(prismaWhere, { type });
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
    const { type, amount, detail, organizationId, userCreatedId } = options;

    const financialMgt = this.client.finance.create({
      data: {
        type,
        detail,
        amount,
        slug: `${Slug(detail)}-${generateNumber(4)}`,
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
    const { type, amount, detail, userCreatedId, deletedAt } = options;

    const finance = this.client.finance.update({
      where: { id: financeId },
      data: {
        type,
        amount,
        detail,
        userCreatedId,
        deletedAt,
      },
    });

    return finance;
  }

  /** Get finances transactiions. */
  async getFinanceTransactions() {
    const [totalIncome, totalExpenses] = await this.client.$transaction([
      this.client.finance.findMany({
        where: { type: 'INCOME', deletedAt: null },
      }),
      this.client.finance.findMany({
        where: { type: 'EXPENSE', deletedAt: null },
      }),
    ]);

    const initialValue = 0;
    const sumIncome = totalIncome.reduce(
      (accumulator: any, currentValue: any) =>
        accumulator + currentValue.amount,
      initialValue,
    );

    const sumExpense = totalExpenses.reduce(
      (accumulator: any, currentValue: any) =>
        accumulator + currentValue.amount,
      initialValue,
    );

    return { sumIncome, sumExpense };
  }
}
