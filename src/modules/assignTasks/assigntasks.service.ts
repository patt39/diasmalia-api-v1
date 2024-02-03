import { Injectable } from '@nestjs/common';
import { AssignTask, Prisma } from '@prisma/client';
import { DatabaseService } from '../../app/database/database.service';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import {
  AllAssignedTaskSelect,
  CreateAssignTasksOptions,
  GetAssignTasksSelections,
  GetOneAssignTaskSelections,
  UpdateAssignTasksOptions,
  UpdateAssignTasksSelections,
} from './assigntasks.type';

@Injectable()
export class AssignTasksService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(
    selections: GetAssignTasksSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhereAssignTask = {} as Prisma.AssignTaskWhereInput;
    const { search, taskId, userId, organizationId, pagination } = selections;

    if (search) {
      Object.assign(prismaWhereAssignTask, {
        OR: [
          {
            contributor: { contains: search, mode: 'insensitive' },
          },
        ],
      });
    }

    if (organizationId) {
      Object.assign(prismaWhereAssignTask, { organizationId });
    }

    if (taskId) {
      Object.assign(prismaWhereAssignTask, { taskId });
    }

    if (userId) {
      Object.assign(prismaWhereAssignTask, { userId });
    }

    const assignTask = await this.client.assignTask.findMany({
      where: { ...prismaWhereAssignTask, deletedAt: null },
      take: pagination.take,
      skip: pagination.skip,
      select: AllAssignedTaskSelect,
      orderBy: pagination.orderBy,
    });

    const rowCount = await this.client.assignTask.count({
      where: { ...prismaWhereAssignTask, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      value: assignTask,
    });
  }

  /** Find one Tasks to the database. */
  async findOneBy(selections: GetOneAssignTaskSelections) {
    const prismaWhere = {} as Prisma.AssignTaskWhereInput;

    const { assignTaskId, userId, organizationId } = selections;

    if (assignTaskId) {
      Object.assign(prismaWhere, { id: assignTaskId });
    }

    if (userId) {
      Object.assign(prismaWhere, { userId });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    const assignTask = await this.client.assignTask.findFirst({
      where: { ...prismaWhere, deletedAt: null },
    });

    return assignTask;
  }

  /** Create one Tasks to the database. */
  async createOne(options: CreateAssignTasksOptions): Promise<AssignTask> {
    const { taskId, userId, organizationId, userCreatedId } = options;

    const assignTask = this.client.assignTask.create({
      data: {
        taskId,
        userId,
        organizationId,
        userCreatedId,
      },
    });

    return assignTask;
  }

  /** Update one Tasks to the database. */
  async updateOne(
    selections: UpdateAssignTasksSelections,
    options: UpdateAssignTasksOptions,
  ): Promise<AssignTask> {
    const { assignTaskId } = selections;
    const { taskId, userId, deletedAt } = options;

    const assignTask = this.client.assignTask.update({
      where: {
        id: assignTaskId,
      },
      data: {
        taskId,
        userId,
        deletedAt,
      },
    });

    return assignTask;
  }
}
