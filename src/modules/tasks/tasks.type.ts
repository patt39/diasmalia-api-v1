import { Task } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetTasksSelections = {
  search?: string;
  type?: string;
  status?: string;
  organizationId: string;
  contributorId: string;
  animalTypeId: string;
  pagination?: PaginationType;
};

export type GetOneTasksSelections = {
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
  type: true,
  title: true,
  status: true,
  dueDate: true,
  periode: true,
  frequency: true,
  description: true,
  contributorId: true,
  contributor: {
    select: {
      userId: true,
      userCreatedId: true,
      user: {
        select: {
          profile: {
            select: {
              firstName: true,
              lastName: true,
              photo: true,
            },
          },
        },
      },
    },
  },
  animalTypeId: true,
  animalType: {
    select: {
      name: true,
    },
  },
  organizationId: true,
  organization: { select: { name: true } },
  userCreatedId: true,
};
