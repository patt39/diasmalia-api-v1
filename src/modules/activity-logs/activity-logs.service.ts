import { Injectable } from '@nestjs/common';
import { ActivityLog, Prisma } from '@prisma/client';
import { DatabaseService } from '../../app/database/database.service';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import {
  ActivityLogsSelections,
  CreateActivityLogsOptions,
  GetOneActivityLogSelections,
} from './activity-logs.type';

@Injectable()
export class ActivityLogsService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(
    selections: ActivityLogsSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhere = {} as Prisma.ActivityLogWhereInput;
    const { search, pagination } = selections;

    if (search) {
      Object.assign(prismaWhere, {
        OR: [{ date: { contains: search, mode: 'insensitive' } }],
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
  /** Find one animalType in database. */
  async findOneBy(selections: GetOneActivityLogSelections) {
    const prismaWhere = {} as Prisma.ActivityLogWhereInput;
    const { userId } = selections;

    const activityLog = await this.client.activityLog.findFirst({
      where: { ...prismaWhere, deletedAt: null },
    });

    return activityLog;
  }

  /** Create one animalType in database. */
  async createOne(options: CreateActivityLogsOptions): Promise<ActivityLog> {
    const {
      date,
      userId,
      ipAddress,
      actionId,
      userAgent,
      message,
      organizationId,
    } = options;

    const activityLog = this.client.activityLog.create({
      data: {
        date,
        userId,
        message,
        actionId,
        userAgent,
        ipAddress,
        organizationId,
      },
    });

    return activityLog;
  }
}
