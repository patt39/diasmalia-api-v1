import { Injectable } from '@nestjs/common';
import {
  CreateTasksOptions,
  GetTasksSelections,
  GetOneTasksSelections,
  UpdateTasksOptions,
  UpdateTasksSelections,
} from './tasks.type';
import { DatabaseService } from '../../app/database/database.service';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import { Task, Prisma } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(
    selections: GetTasksSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhereTask = {} as Prisma.TaskWhereInput;
    const { search, pagination } = selections;

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

    const Tasks = await this.client.task.findMany({
      take: pagination.take,
      orderBy: pagination.orderBy,
      where: { ...prismaWhereTask, deletedAt: null },
      skip: pagination?.cursor ? 1 : pagination.skip,
      cursor: pagination.cursor ? { id: pagination.cursor } : undefined,
    });

    const rowCount = await this.client.task.count({
      where: { ...prismaWhereTask, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      value: Tasks,
    });
  }

  /** Find one Tasks to the database. */
  async findOneBy(selections: GetOneTasksSelections) {
    const { taskId } = selections;
    const contact = await this.client.task.findUnique({
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
      userId,
      organizationId,
      userCreatedId,
    } = options;

    const task = this.client.task.create({
      data: {
        title,
        description,
        dueDate: new Date(dueDate),
        userId,
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
    const { title, description, dueDate, userId, deletedAt } = options;

    const task = this.client.task.update({
      where: {
        id: taskId,
      },
      data: {
        title,
        description,
        dueDate: new Date(dueDate),
        userId,
        deletedAt,
      },
    });

    return task;
  }
}
