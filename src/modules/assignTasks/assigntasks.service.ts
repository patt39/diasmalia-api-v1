import { Injectable } from '@nestjs/common';
import { AssignTask, Prisma } from '@prisma/client';
import { DatabaseService } from '../../app/database/database.service';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import {
  AssignTaskSelect,
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
    const prismaWhereTask = {} as Prisma.AssignTaskWhereInput;
    const { search, organizationId, pagination } = selections;

    if (search) {
      Object.assign(prismaWhereTask, {
        OR: [
          {
            contributor: { contains: search, mode: 'insensitive' },
          },
        ],
      });
    }

    if (organizationId) {
      Object.assign(prismaWhereTask, { organizationId });
    }

    const tasks = await this.client.assignTask.findMany({
      where: { ...prismaWhereTask, deletedAt: null },
      take: pagination.take,
      skip: pagination.skip,
      select: AssignTaskSelect,
      orderBy: pagination.orderBy,
    });

    const rowCount = await this.client.assignTask.count({
      where: { ...prismaWhereTask, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      value: tasks,
    });
  }

  /** Find one Tasks to the database. */
  async findOneBy(selections: GetOneAssignTaskSelections) {
    const prismaWhere = {} as Prisma.AssignTaskWhereInput;

    const { assignTaskId, contributorId, organizationId } = selections;

    if (assignTaskId) {
      Object.assign(prismaWhere, { id: assignTaskId });
    }

    if (contributorId) {
      Object.assign(prismaWhere, { contributorId });
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
    const { taskId, contributorId, organizationId, userCreatedId } = options;

    const assignTask = this.client.assignTask.create({
      data: {
        taskId,
        contributorId,
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
    const { taskId, contributorId, deletedAt } = options;

    const assignTask = this.client.assignTask.update({
      where: {
        id: assignTaskId,
      },
      data: {
        taskId,
        contributorId,
        deletedAt,
      },
    });

    return assignTask;
  }

  /** Find all contributor tasks in database. */
  async findAllTasks(selections: GetOneAssignTaskSelections) {
    const prismaWhereContributor = {} as Prisma.ContributorWhereInput;
    const { contributorId } = selections;

    if (contributorId) {
      Object.assign(prismaWhereContributor, { id: contributorId });
    }

    const contributor = await this.client.contributor.findFirst({
      where: { ...prismaWhereContributor, deletedAt: null },
      include: {
        assigneTasks: true,
      },
    });

    return contributor;
  }
}
