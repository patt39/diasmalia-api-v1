import { ActivityLog } from '@prisma/client';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type ActivityLogsSelections = {
  search?: string;
  pagination?: PaginationType;
  periode?: number;
  userId: string;
  organizationId: string;
};

export type CreateActivityLogsOptions = Partial<ActivityLog>;

export class GetActivityLogsByPeriodeQuery {
  @IsOptional()
  @IsString()
  periode: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  userId: string;
}
