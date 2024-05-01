import { ActivityLog } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type ActivityLogsSelections = {
  search?: string;
  pagination?: PaginationType;
};

export type GetOneActivityLogSelections = {
  userId?: string;
};

export type UpdateActivityLogsSelections = {
  animalTypeId: ActivityLog['id'];
};

export type CreateActivityLogsOptions = Partial<ActivityLog>;

export const AnimalTypesSelect = {
  createdAt: true,
  id: true,
  name: true,
  icon: true,
};
