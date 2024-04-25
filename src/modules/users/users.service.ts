import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { DatabaseService } from '../../app/database/database.service';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
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
    const { pagination, search } = selections;

    if (search) {
      Object.assign(prismaWhere, {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { profile: { firstName: { contains: search, mode: 'insensitive' } } },
          { profile: { lastName: { contains: search, mode: 'insensitive' } } },
        ],
      });
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
      include: {
        profile: true,
        organization: { select: { name: true, logo: true, currency: true } },
      },
    });

    return user;
  }

  /** Create one User in database. */
  async createOne(options: CreateUsersOptions): Promise<User> {
    const {
      email,
      token,
      username,
      password,
      provider,
      confirmedAt,
      organizationId,
    } = options;

    const user = this.client.user.create({
      data: {
        email,
        token,
        username,
        password,
        provider,
        confirmedAt,
        organizationId,
      },
    });

    return user;
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
      provider,
      username,
      password,
      confirmedAt,
      organizationId,
      deletedAt,
    } = options;

    const user = this.client.user.update({
      where: {
        id: userId,
      },
      data: {
        email,
        token,
        provider,
        username,
        password,
        confirmedAt,
        organizationId,
        deletedAt,
      },
    });

    return user;
  }
}
