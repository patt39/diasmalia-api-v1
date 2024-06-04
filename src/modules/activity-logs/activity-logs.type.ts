import { ActivityLog } from '@prisma/client';
import { IsOptional } from 'class-validator';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type PeriodeType =
  | 'ALL'
  | 'LAST 7 DAYS'
  | 'LAST 15 DAYS'
  | 'LAST 30 DAYS';

export type ActivityLogsSelections = {
  search?: string;
  pagination?: PaginationType;
  periode?: PeriodeType;
  organizationId: string;
};

export type CreateActivityLogsOptions = Partial<ActivityLog>;

export class GetActivityLogsByPeriodeQuery {
  @IsOptional()
  periode: PeriodeType;
}

export const AnimalTypesSelect = {
  createdAt: true,
  id: true,
  name: true,
  icon: true,
};
