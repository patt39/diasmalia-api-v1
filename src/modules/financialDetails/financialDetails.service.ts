import { Injectable } from '@nestjs/common';
import {
  CreateFinancialDetailsOptions,
  GetFinancialDetailsSelections,
  GetOneFinancialDetailsSelections,
  UpdateFinancialDetailsOptions,
  UpdateFinancialDetailsSelections,
  FinancialDetailsSelect,
} from './financialDetails.type';
import { DatabaseService } from '../../app/database/database.service';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import { Prisma, FinancialDetail } from '@prisma/client';

@Injectable()
export class FinancialDetailService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(
    selections: GetFinancialDetailsSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhere = {} as Prisma.FinancialDetailWhereInput;
    const { search, organizationId, pagination } = selections;

    if (search) {
      Object.assign(prismaWhere, {
        OR: [
          {
            name: { contains: search, mode: 'insensitive' },
          },
        ],
      });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    const financialDetail = await this.client.financialDetail.findMany({
      where: { ...prismaWhere, deletedAt: null },
      take: pagination.take,
      skip: pagination.skip,
      select: FinancialDetailsSelect,
      orderBy: pagination.orderBy,
    });

    const rowCount = await this.client.financialDetail.count({
      where: { ...prismaWhere, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      value: financialDetail,
    });
  }

  /** Find one financialDetail database. */
  async findOneBy(selections: GetOneFinancialDetailsSelections) {
    const { financialDetailId } = selections;
    const financialDetail = await this.client.financialDetail.findUnique({
      select: FinancialDetailsSelect,
      where: {
        id: financialDetailId,
      },
    });

    return financialDetail;
  }

  /** Create one financialDetail database. */
  async createOne(
    options: CreateFinancialDetailsOptions,
  ): Promise<FinancialDetail> {
    const { name, organizationId, userCreatedId } = options;

    const financialDetail = this.client.financialDetail.create({
      data: {
        name,
        organizationId,
        userCreatedId,
      },
    });

    return financialDetail;
  }

  /** Update one financialDetail in database. */
  async updateOne(
    selections: UpdateFinancialDetailsSelections,
    options: UpdateFinancialDetailsOptions,
  ): Promise<FinancialDetail> {
    const { financialDetailId } = selections;
    const { name, deletedAt } = options;

    const financialDetail = this.client.financialDetail.update({
      where: {
        id: financialDetailId,
      },
      data: {
        name,
        deletedAt,
      },
    });

    return financialDetail;
  }
}
