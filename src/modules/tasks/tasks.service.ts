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
    const { search, organizationId, pagination, contributorId, animalTypeId } =
      selections;

    if (search) {
      Object.assign(prismaWhereTask, {
        OR: [
          {
            title: { contains: search, mode: 'insensitive' },
            description: { contains: search, mode: 'insensitive' },
          },
          {
            contributor: {
              profile: { firstName: { contains: search, mode: 'insensitive' } },
            },
          },
          {
            contributor: {
              profile: { lastName: { contains: search, mode: 'insensitive' } },
            },
          },
        ],
      });
    }

    if (animalTypeId) {
      Object.assign(prismaWhereTask, { animalTypeId });
    }

    if (organizationId) {
      Object.assign(prismaWhereTask, { organizationId });
    }

    if (contributorId) {
      Object.assign(prismaWhereTask, { contributorId });
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
    const { taskId, organizationId } = selections;

    if (organizationId) {
      Object.assign(prismaWhereTask, { organizationId });
    }

    if (taskId) {
      Object.assign(prismaWhereTask, { id: taskId });
    }
    const task = await this.client.task.findFirst({
      where: { ...prismaWhereTask, deletedAt: null },
      select: TaskSelect,
    });

    return task;
  }

  /** Create one Tasks to the database. */
  async createOne(options: CreateTasksOptions): Promise<Task> {
    const {
      type,
      title,
      dueDate,
      periode,
      frequency,
      animalTypeId,
      description,
      contributorId,
      organizationId,
      userCreatedId,
    } = options;

    const task = this.client.task.create({
      data: {
        type,
        title,
        dueDate,
        periode,
        frequency,
        animalTypeId,
        description,
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
    const {
      type,
      title,
      dueDate,
      periode,
      frequency,
      animalTypeId,
      description,
      contributorId,
      deletedAt,
    } = options;

    const task = this.client.task.update({
      where: { id: taskId },
      data: {
        type,
        title,
        periode,
        dueDate,
        frequency,
        animalTypeId,
        description,
        contributorId,
        deletedAt,
      },
    });

    return task;
  }
}
