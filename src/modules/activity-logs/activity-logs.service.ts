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
} from './activity-logs.type';

@Injectable()
export class ActivityLogsService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(
    selections: ActivityLogsSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhere = {} as Prisma.ActivityLogWhereInput;
    const { periode, search, pagination, organizationId } = selections;

    if (search) {
      Object.assign(prismaWhere, {
        OR: [{ date: { contains: search, mode: 'insensitive' } }],
      });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    if (periode === 'LAST 7 DAYS') {
      const today = new Date(); // Current date
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(today.getDate() - 7); // Calculate date 7 days ago

      const dataFromLast7Days = await this.client.activityLog.findMany({
        where: {
          createdAt: {
            gte: sevenDaysAgo, // Greater than or equal to 7 days ago
            lte: today, // Less than or equal to today (optional, if you want to include today)
          },
          deletedAt: null,
        },
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
        value: dataFromLast7Days,
      });
    }

    if (periode === 'LAST 15 DAYS') {
      const today = new Date();
      const fifteenDaysAgo = new Date();
      fifteenDaysAgo.setDate(today.getDate() - 15);

      const dataFromLast15Days = await this.client.activityLog.findMany({
        where: {
          createdAt: {
            gte: fifteenDaysAgo,
            lte: today,
          },
          deletedAt: null,
        },
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
        value: dataFromLast15Days,
      });
    }

    if (periode === 'LAST 30 DAYS') {
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);

      const dataFromLast30Days = await this.client.activityLog.findMany({
        where: {
          createdAt: {
            gte: thirtyDaysAgo,
            lte: today,
          },
          deletedAt: null,
        },
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
        value: dataFromLast30Days,
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
