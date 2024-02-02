import { Injectable } from '@nestjs/common';
import { Prisma, Task } from '@prisma/client';
import { DatabaseService } from '../../app/database/database.service';
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
    const { search, organizationId, pagination } = selections;

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

  /** Find one Tasks to the database. */
  async findOneBy(selections: GetOneTasksSelections) {
    const { taskId } = selections;
    const contact = await this.client.task.findUnique({
      select: TaskSelect,
      where: {
        id: taskId,
      },
    });

    return contact;
  }

  /** Create one Tasks to the database. */
  async createOne(options: CreateTasksOptions): Promise<Task> {
    const {
      title,
      description,
      dueDate,
      status,
      contributorId,
      organizationId,
      userCreatedId,
    } = options;

    const task = this.client.task.create({
      data: {
        title,
        description,
        status,
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
