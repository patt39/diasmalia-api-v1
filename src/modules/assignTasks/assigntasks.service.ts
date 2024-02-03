import { Injectable } from '@nestjs/common';
import { AssignTask, Prisma } from '@prisma/client';
import { DatabaseService } from '../../app/database/database.service';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import {
  AllAssignedTaskSelect,
  AllUserAssignedTaskSelect,
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
    const { search, organizationId, pagination } = selections;

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

  /** Find all contributor tasks in database. */
  async findAllTasks(
    selections: GetOneAssignTaskSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhereUser = {} as Prisma.UserWhereInput;
    const { userId, taskId, search, organizationId, pagination } = selections;

    if (search) {
      Object.assign(prismaWhereUser, {
        OR: [
          {
            title: { contains: search, mode: 'insensitive' },
          },
        ],
      });
    }

    if (organizationId) {
      Object.assign(prismaWhereUser, { organizationId });
    }

    if (userId) {
      Object.assign(prismaWhereUser, { id: userId });
    }

    if (taskId) {
      Object.assign(prismaWhereUser, { taskId });
    }

    const user = await this.client.user.findFirst({
      where: { ...prismaWhereUser, deletedAt: null },
      select: AllUserAssignedTaskSelect,
    });

    const rowCount = await this.client.user.count({
      where: { ...prismaWhereUser, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      value: user,
    });
  }
}
