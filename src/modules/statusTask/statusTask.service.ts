import { Injectable } from '@nestjs/common';
import {
  CreateStatusTaskOptions,
  GetStatusTaskSelections,
  GetOneStatusTaskSelections,
  UpdateStatusTaskOptions,
  UpdateStatusTaskSelections,
  StatusTaskSelect,
} from './statusTask.type';
import { DatabaseService } from '../../app/database/database.service';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import { Diagnosis, Prisma } from '@prisma/client';

@Injectable()
export class StatusTaskService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(
    selections: GetStatusTaskSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhere = {} as Prisma.StatusTaskWhereInput;
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

    const statusTask = await this.client.statusTask.findMany({
      where: { ...prismaWhere, deletedAt: null },
      take: pagination.take,
      skip: pagination.skip,
      select: StatusTaskSelect,
      orderBy: pagination.orderBy,
    });

    const rowCount = await this.client.statusTask.count({
      where: { ...prismaWhere, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      value: statusTask,
    });
  }

  /** Find one StatusTask in database. */
  async findOneBy(selections: GetOneStatusTaskSelections) {
    const { statusTaskId } = selections;
    const statusTask = await this.client.statusTask.findUnique({
      select: StatusTaskSelect,
      where: {
        id: statusTaskId,
      },
    });

    return statusTask;
  }

  /** Create one StatusTask in database. */
  async createOne(options: CreateStatusTaskOptions): Promise<Diagnosis> {
    const { name, organizationId, userCreatedId } = options;

    const statusTask = this.client.statusTask.create({
      data: {
        name,
        organizationId,
        userCreatedId,
      },
    });

    return statusTask;
  }

  /** Update one statusTask in database. */
  async updateOne(
    selections: UpdateStatusTaskSelections,
    options: UpdateStatusTaskOptions,
  ): Promise<Diagnosis> {
    const { statusTaskId } = selections;
    const { name, deletedAt } = options;

    const statusTask = this.client.statusTask.update({
      where: {
        id: statusTaskId,
      },
      data: {
        name,
        deletedAt,
      },
    });

    return statusTask;
  }
}
