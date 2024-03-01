import { AssignTask } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetAssignTasksSelections = {
  search?: string;
  taskId?: AssignTask['taskId'];
  userId?: AssignTask['userId'];
  organizationId: string;
  pagination?: PaginationType;
};

export type GetOneAssignTaskSelections = {
  search?: string;
  pagination?: PaginationType;
  assignTaskId?: AssignTask['id'];
  organizationId?: AssignTask['organizationId'];
};

export type UpdateAssignTasksSelections = {
  assignTaskId: AssignTask['id'];
};

export type CreateAssignTasksOptions = Partial<AssignTask>;

export type UpdateAssignTasksOptions = Partial<AssignTask>;

export const AllAssignedTaskSelect = {
  createdAt: true,
  id: true,
  userId: true,
  user: {
    select: {
      email: true,
      profile: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  },
  taskId: true,
  task: {
    select: {
      title: true,
      description: true,
      dueDate: true,
      status: true,
    },
  },
  organizationId: true,
};

export const AllUserAssignedTaskSelect = {
  createdAt: true,
  id: true,
  profile: {
    select: {
      firstName: true,
      lastName: true,
    },
  },
  assignTasks: {
    select: {
      taskId: true,
      task: {
        select: {
          title: true,
          description: true,
          dueDate: true,
          status: true,
        },
      },
    },
  },
  organizationId: true,
};
