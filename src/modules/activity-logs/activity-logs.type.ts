import { ActivityLog } from '@prisma/client';
import { IsOptional, IsString } from 'class-validator';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type ActivityLogsSelections = {
  search?: string;
  pagination?: PaginationType;
  periode?: number;
  organizationId: string;
};

export type CreateActivityLogsOptions = Partial<ActivityLog>;

export class GetActivityLogsByPeriodeQuery {
  @IsOptional()
  @IsString()
  periode: string;
}
