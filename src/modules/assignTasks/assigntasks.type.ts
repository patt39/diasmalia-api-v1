import { AssignTask } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetAssignTasksSelections = {
  search?: string;
  organizationId: string;
  pagination?: PaginationType;
};

export type GetOneAssignTaskSelections = {
  assignTaskId?: AssignTask['id'];
  contributorId?: AssignTask['contributorId'];
  organizationId?: AssignTask['organizationId'];
};

export type UpdateAssignTasksSelections = {
  assignTaskId: AssignTask['id'];
};

export type CreateAssignTasksOptions = Partial<AssignTask>;

export type UpdateAssignTasksOptions = Partial<AssignTask>;

export const AssignTaskSelect = {
  createdAt: true,
  id: true,
  taskId: true,
  task: {
    select: {
      title: true,
      description: true,
      dueDate: true,
    },
  },
  contributorId: true,
  contributor: {
    select: {
      role: true,
      user: {
        select: {
          email: true,
          username: true,
        },
      },
    },
  },
  organizationId: true,
};
