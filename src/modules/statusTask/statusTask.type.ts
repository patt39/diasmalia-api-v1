import { StatusTask } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetStatusTaskSelections = {
  search?: string;
  organizationId: string;
  pagination?: PaginationType;
};

export type GetOneStatusTaskSelections = {
  statusTaskId: StatusTask['id'];
};

export type UpdateStatusTaskSelections = {
  statusTaskId: StatusTask['id'];
};

export type CreateStatusTaskOptions = Partial<StatusTask>;

export type UpdateStatusTaskOptions = Partial<StatusTask>;

export const StatusTaskSelect = {
  createdAt: true,
  id: true,
  name: true,
  organizationId: true,
};
