import { Task, TaskStatus } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetTasksSelections = {
  search?: string;
  status?: TaskStatus;
  organizationId: string;
  pagination?: PaginationType;
};

export type GetOneTasksSelections = {
  slug?: string;
  taskId?: Task['id'];
  organizationId?: Task['organizationId'];
};

export type UpdateTasksSelections = {
  taskId: Task['id'];
};

export type CreateTasksOptions = Partial<Task>;

export type UpdateTasksOptions = Partial<Task>;

export const TaskSelect = {
  createdAt: true,
  id: true,
  slug: true,
  title: true,
  status: true,
  dueDate: true,
  description: true,
  contributorId: true,
  contributor: {
    select: {
      user: {
        select: {
          profile: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  },
  organizationId: true,
  userCreatedId: true,
};
