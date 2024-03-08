import { Injectable } from '@nestjs/common';
import { Prisma, Task } from '@prisma/client';
import { DatabaseService } from '../../app/database/database.service';
import { Slug, generateNumber } from '../../app/utils/commons/generate-random';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import {
  CreateTasksOptions,
  GetOneTasksSelections,
  GetTasksSelections,
  TaskSelect,
  UpdateTasksOptions,
  UpdateTasksSelections,
} from './tasks.type';

@Injectable()
export class TasksService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(
    selections: GetTasksSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhereTask = {} as Prisma.TaskWhereInput;
    const { search, status, organizationId, pagination } = selections;

    if (search) {
      Object.assign(prismaWhereTask, {
        OR: [
          {
            title: { contains: search, mode: 'insensitive' },
            description: { contains: search, mode: 'insensitive' },
          },
        ],
      });
    }

    if (organizationId) {
      Object.assign(prismaWhereTask, { organizationId });
    }

    if (status) {
      Object.assign(prismaWhereTask, { status });
    }

    const tasks = await this.client.task.findMany({
      where: { ...prismaWhereTask, deletedAt: null },
      take: pagination.take,
      skip: pagination.skip,
      select: TaskSelect,
      orderBy: pagination.orderBy,
    });

    const rowCount = await this.client.task.count({
      where: { ...prismaWhereTask, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      value: tasks,
    });
  }

  /** Find one task in database. */
  async findOneBy(selections: GetOneTasksSelections) {
    const prismaWhereTask = {} as Prisma.TaskWhereInput;
    const { taskId, organizationId, slug } = selections;

    if (organizationId) {
      Object.assign(prismaWhereTask, { organizationId });
    }

    if (slug) {
      Object.assign(prismaWhereTask, { slug });
    }

    if (taskId) {
      Object.assign(prismaWhereTask, { id: taskId });
    }
    const task = await this.client.task.findFirst({});

    return task;
  }

  /** Create one Tasks to the database. */
  async createOne(options: CreateTasksOptions): Promise<Task> {
    const {
      title,
      status,
      dueDate,
      description,
      contributorId,
      organizationId,
      userCreatedId,
    } = options;

    const task = this.client.task.create({
      data: {
        title,
        status,
        description,
        slug: `${Slug(title)}-${generateNumber(4)}`,
        dueDate: new Date(dueDate),
        contributorId,
        organizationId,
        userCreatedId,
      },
    });

    return task;
  }

  /** Update one Tasks to the database. */
  async updateOne(
    selections: UpdateTasksSelections,
    options: UpdateTasksOptions,
  ): Promise<Task> {
    const { taskId } = selections;
    const { title, description, dueDate, status, contributorId, deletedAt } =
      options;

    const task = this.client.task.update({
      where: {
        id: taskId,
      },
      data: {
        title,
        description,
        dueDate: new Date(dueDate),
        status,
        contributorId,
        deletedAt,
      },
    });

    return task;
  }
}
