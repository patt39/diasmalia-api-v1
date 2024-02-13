import { Injectable } from '@nestjs/common';
import {
  CreateFinancialMgtOptions,
  GetFinancialMgtSelections,
  GetOneFinancialMgtSelections,
  UpdateFinancialMgtOptions,
  UpdateFinancialMgtSelections,
  FinancialMgtSelect,
} from './financialMgt.type';
import { DatabaseService } from '../../app/database/database.service';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import { FinancialMgt, Prisma } from '@prisma/client';

@Injectable()
export class FinancialMgtService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(
    selections: GetFinancialMgtSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhere = {} as Prisma.FinancialMgtWhereInput;
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

    const financialMgt = await this.client.financialMgt.findMany({
      where: { ...prismaWhere, deletedAt: null },
      take: pagination.take,
      skip: pagination.skip,
      select: FinancialMgtSelect,
      orderBy: pagination.orderBy,
    });

    const rowCount = await this.client.financialMgt.count({
      where: { ...prismaWhere, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      value: financialMgt,
    });
  }

  /** Find one financialMgt database. */
  async findOneBy(selections: GetOneFinancialMgtSelections) {
    const { financialMgtId } = selections;
    const financialMgt = await this.client.financialMgt.findUnique({
      select: FinancialMgtSelect,
      where: {
        id: financialMgtId,
      },
    });

    return financialMgt;
  }

  /** Create one financialMgt database. */
  async createOne(options: CreateFinancialMgtOptions): Promise<FinancialMgt> {
    const {
      date,
      note,
      amount,
      type,
      financialDetailId,
      organizationId,
      userCreatedId,
    } = options;

    const financialMgt = this.client.financialMgt.create({
      data: {
        date,
        note,
        amount,
        type,
        financialDetailId,
        organizationId,
        userCreatedId,
      },
    });

    return financialMgt;
  }

  /** Update one financialMgt in database. */
  async updateOne(
    selections: UpdateFinancialMgtSelections,
    options: UpdateFinancialMgtOptions,
  ): Promise<FinancialMgt> {
    const { financialMgtId } = selections;
    const {
      date,
      note,
      amount,
      type,
      financialDetailId,
      organizationId,
      userCreatedId,
      deletedAt,
    } = options;

    const financialMgt = this.client.financialMgt.update({
      where: {
        id: financialMgtId,
      },
      data: {
        date,
        note,
        amount,
        type,
        financialDetailId,
        organizationId,
        userCreatedId,
        deletedAt,
      },
    });

    return financialMgt;
  }
}
