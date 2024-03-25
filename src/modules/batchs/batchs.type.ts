import { Batch } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetBatchsSelections = {
  search?: string;
  type?: Batch['type'];
  organizationId?: string;
  pagination?: PaginationType;
};

export type GetOneBatchSelections = {
  batchId?: Batch['id'];
  type?: Batch['type'];
  organizationId?: string;
};

export type UpdateBatchsSelections = {
  batchId: Batch['id'];
};

export type CreateBatchsOptions = Partial<Batch>;

export type UpdateBatchsOptions = Partial<Batch>;

export const BatchsSelect = {
  createdAt: true,
  id: true,
  quantity: true,
  type: true,
  weight: true,
  locationId: true,
  organizationId: true,
  userCreatedId: true,
};
