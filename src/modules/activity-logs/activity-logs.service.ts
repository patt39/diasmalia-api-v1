import { Injectable } from '@nestjs/common';
import { ActivityLog, Prisma } from '@prisma/client';
import { DatabaseService } from '../../app/database/database.service';
import {
  dateTimeNowUtc,
  substrateDaysToTimeNowUtcDate,
} from '../../app/utils/commons/formate-date';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import {
  ActivityLogsSelections,
  CreateActivityLogsOptions,
} from './activity-logs.type';

@Injectable()
export class ActivityLogsService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(
    selections: ActivityLogsSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhere = {} as Prisma.ActivityLogWhereInput;
    const { periode, pagination, organizationId } = selections;

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    if (periode) {
      Object.assign(prismaWhere, {
        createdAt: {
          gte: substrateDaysToTimeNowUtcDate(Number(periode)),
          lte: dateTimeNowUtc(),
        },
      });
    }

    const activityLogs = await this.client.activityLog.findMany({
      where: { ...prismaWhere, deletedAt: null },
      take: pagination.take,
      skip: pagination.skip,
      orderBy: pagination.orderBy,
    });

    const rowCount = await this.client.activityLog.count({
      where: { ...prismaWhere, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      value: activityLogs,
    });
  }

  /** Create one activity log in database. */
  async createOne(options: CreateActivityLogsOptions): Promise<ActivityLog> {
    const { userId, ipAddress, userAgent, message, organizationId } = options;

    const activityLog = this.client.activityLog.create({
      data: {
        userId,
        message,
        userAgent,
        ipAddress,
        organizationId,
      },
    });

    return activityLog;
  }
}
