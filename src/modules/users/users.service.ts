import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { DatabaseService } from '../../app/database/database.service';
import {
  dateTimeNowUtc,
  lastDayMonth,
  substrateDaysToTimeNowUtcDate,
} from '../../app/utils/commons';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import { groupCountUsersByDateAndReturnArray } from './users.analytics.utils';
import {
  CreateUsersOptions,
  GetOneUsersSelections,
  GetUsersSelections,
  UpdateUsersOptions,
  UpdateUsersSelections,
  UserSelect,
} from './users.type';

@Injectable()
export class UsersService {
  constructor(private readonly client: DatabaseService) {}

  /** Get all users in database. */
  async findAll(
    selections: GetUsersSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhere = {} as Prisma.UserWhereInput;
    const { pagination, search, member } = selections;

    if (search) {
      Object.assign(prismaWhere, {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { profile: { firstName: { contains: search, mode: 'insensitive' } } },
          { profile: { lastName: { contains: search, mode: 'insensitive' } } },
        ],
      });
    }

    if (member) {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      member === 'true'
        ? Object.assign(prismaWhere, { member: true })
        : Object.assign(prismaWhere, { member: false });
    }

    const users = await this.client.user.findMany({
      where: { ...prismaWhere, deletedAt: null },
      skip: pagination.skip,
      select: UserSelect,
      take: pagination.take,
      orderBy: pagination.orderBy,
    });
    const rowCount = await this.client.user.count({
      where: { ...prismaWhere, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      value: users,
    });
  }

  /** Find one User in  database. */
  async findOneBy(selections: GetOneUsersSelections) {
    const prismaWhereUser = {} as Prisma.UserWhereInput;
    const { userId, organizationId, email, provider } = selections;

    if (email) {
      Object.assign(prismaWhereUser, { email: email.toLocaleLowerCase() });
    }

    if (provider) {
      Object.assign(prismaWhereUser, { provider });
    }

    if (userId) {
      Object.assign(prismaWhereUser, { id: userId });
    }

    if (organizationId) {
      Object.assign(prismaWhereUser, { organizationId });
    }

    const user = await this.client.user.findFirst({
      where: { ...prismaWhereUser, deletedAt: null },
      select: {
        password: true,
        id: true,
        email: true,
        member: true,
        confirmedAt: true,
        organizationId: true,
        profile: true,
        organization: {
          select: {
            name: true,
            description: true,
          },
        },
      },
    });

    return user;
  }

  /** Find one User in  database. */
  async findMe(selections: GetOneUsersSelections) {
    const prismaWhereUser = {} as Prisma.UserWhereInput;
    const { userId, organizationId } = selections;

    if (userId) {
      Object.assign(prismaWhereUser, { id: userId });
    }

    if (organizationId) {
      Object.assign(prismaWhereUser, { organizationId });
    }

    const user = await this.client.user.findFirst({
      where: { ...prismaWhereUser, deletedAt: null },
      select: UserSelect,
    });

    return user;
  }

  /** Create one User in database. */
  async createOne(options: CreateUsersOptions): Promise<User> {
    const {
      email,
      token,
      password,
      provider,
      isConfirmed,
      confirmedAt,
      organizationId,
    } = options;

    const user = this.client.user.create({
      data: {
        email,
        token,
        password,
        provider,
        isConfirmed,
        confirmedAt,
        organizationId,
      },
    });

    return user;
  }

  /** Get users analytics. */
  async getUsersAnalytics(selections: GetUsersSelections) {
    const prismaWhere = {} as Prisma.UserWhereInput;
    const { periode, months, year, organizationId } = selections;

    if (periode) {
      Object.assign(prismaWhere, {
        createdAt: {
          gte: substrateDaysToTimeNowUtcDate(Number(periode)),
          lte: dateTimeNowUtc(),
        },
      });
    }

    if (year) {
      Object.assign(prismaWhere, {
        createdAt: {
          gte: new Date(`${Number(year)}-01-01`),
          lte: new Date(`${Number(year) + 1}-01-01`),
        },
      });
      if (months) {
        Object.assign(prismaWhere, {
          createdAt: {
            gte: new Date(`${year}-${months}-01`),
            lte: lastDayMonth({
              year: Number(year),
              month: Number(months),
            }),
          },
        });
      }
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    const groupUsers = await this.client.user.groupBy({
      by: ['createdAt', 'organizationId'],
      where: {
        ...prismaWhere,
        deletedAt: null,
      },
      _count: true,
    });

    const userAnalytics = groupCountUsersByDateAndReturnArray({
      data: groupUsers,
      year: year,
      month: months,
    });

    return userAnalytics;
  }

  /** Update one User in database. */
  async updateOne(
    selections: UpdateUsersSelections,
    options: UpdateUsersOptions,
  ): Promise<User> {
    const { userId } = selections;
    const {
      email,
      token,
      member,
      provider,
      password,
      confirmedAt,
      organizationId,
      deletedAt,
    } = options;

    const user = this.client.user.update({
      where: { id: userId },
      data: {
        email,
        token,
        member,
        provider,
        password,
        confirmedAt,
        organizationId,
        deletedAt,
      },
    });

    return user;
  }

  /** Get users transactions. */
  async getUsersTransactions() {
    const [users, administrators, animalTypes] = await this.client.$transaction(
      [
        this.client.user.count({
          where: {
            deletedAt: null,
          },
        }),
        this.client.user.count({
          where: {
            member: true,
            deletedAt: null,
          },
        }),
        this.client.animalType.count({
          where: {
            status: true,
            deletedAt: null,
          },
        }),
      ],
    );

    return {
      users,
      administrators,
      animalTypes,
    };
  }
}
