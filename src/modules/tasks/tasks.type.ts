import { Task } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetTasksSelections = {
  search?: string;
  pagination?: PaginationType;
};

export type GetOneTasksSelections = {
  taskId: Task['id'];
};

export type UpdateTasksSelections = {
  taskId: Task['id'];
};

export type CreateTasksOptions = Partial<Task>;

export type UpdateTasksOptions = Partial<Task>;
