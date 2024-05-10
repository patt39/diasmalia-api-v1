import { ActivityLog } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type ActivityLogsSelections = {
  search?: string;
  pagination?: PaginationType;
  period?: 'ALL' | 'LAST 7 DAYS' | 'LAST 15 DAYS' | 'LAST 30 DAYS';
};

export type CreateActivityLogsOptions = Partial<ActivityLog>;

export const AnimalTypesSelect = {
  createdAt: true,
  id: true,
  name: true,
  icon: true,
};
