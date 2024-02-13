import { Task } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetTasksSelections = {
  search?: string;
  organizationId: string;
  pagination?: PaginationType;
};

export type GetOneTasksSelections = {
  taskId: Task['id'];
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
  title: true,
  description: true,
  status: true,
  dueDate: true,
  organizationId: true,
};
