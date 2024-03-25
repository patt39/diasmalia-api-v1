import { Injectable } from '@nestjs/common';
import { Batch, Prisma } from '@prisma/client';
import { DatabaseService } from '../../app/database/database.service';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import {
  BatchsSelect,
  CreateBatchsOptions,
  GetBatchsSelections,
  GetOneBatchSelections,
  UpdateBatchsOptions,
  UpdateBatchsSelections,
} from './batchs.type';

@Injectable()
export class BatchsService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(
    selections: GetBatchsSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhere = {} as Prisma.BatchWhereInput;
    const { search, type, pagination } = selections;

    if (search) {
      Object.assign(prismaWhere, {
        OR: [
          {
            name: { contains: search, mode: 'insensitive' },
          },
        ],
      });
    }

    if (type) {
      Object.assign(prismaWhere, { type });
    }

    const batchs = await this.client.batch.findMany({
      where: { ...prismaWhere, deletedAt: null },
      take: pagination.take,
      skip: pagination.skip,
      select: BatchsSelect,
      orderBy: pagination.orderBy,
    });

    const rowCount = await this.client.batch.count({
      where: { ...prismaWhere, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      value: batchs,
    });
  }

  /** Find one batch in database. */
  async findOneBy(selections: GetOneBatchSelections) {
    const prismaWhere = {} as Prisma.BatchWhereInput;

    const { batchId, type, organizationId } = selections;

    if (batchId) {
      Object.assign(prismaWhere, { id: batchId });
    }

    if (type) {
      Object.assign(prismaWhere, { type });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    const batch = await this.client.batch.findFirst({
      where: { ...prismaWhere, deletedAt: null },
    });

    return batch;
  }

  /** Create one batch in database. */
  async createOne(options: CreateBatchsOptions): Promise<Batch> {
    const {
      type,
      weight,
      quantity,
      locationId,
      organizationId,
      userCreatedId,
    } = options;

    const batch = this.client.batch.create({
      data: {
        type,
        weight,
        quantity,
        locationId,
        organizationId,
        userCreatedId,
      },
    });

    return batch;
  }

  /** Update one batch in database. */
  async updateOne(
    selections: UpdateBatchsSelections,
    options: UpdateBatchsOptions,
  ): Promise<Batch> {
    const { batchId } = selections;
    const { quantity, weight, type, locationId, deletedAt } = options;

    const batch = this.client.batch.update({
      where: {
        id: batchId,
      },
      data: { quantity, weight, type, locationId, deletedAt },
    });

    return batch;
  }
}
