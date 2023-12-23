import { Injectable } from '@nestjs/common';
import {
  CreateUsersOptions,
  GetOneUsersSelections,
  UpdateUsersOptions,
  UpdateUsersSelections,
} from './users.type';
import { DatabaseService } from '../../app/database/database.service';
import { User, Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly client: DatabaseService) {}

  /** Find one Users to the database. */
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
    });

    return user;
  }

  /** Create one Users to the database. */
  async createOne(options: CreateUsersOptions): Promise<User> {
    const {
      email,
      refreshToken,
      accessToken,
      organizationId,
      password,
      token,
      provider,
      username,
      confirmedAt,
    } = options;

    const user = this.client.user.create({
      data: {
        email,
        refreshToken,
        accessToken,
        organizationId,
        password,
        token,
        provider,
        username,
        confirmedAt,
      },
    });

    return user;
  }

  /** Update one Users to the database. */
  async updateOne(
    selections: UpdateUsersSelections,
    options: UpdateUsersOptions,
  ): Promise<User> {
    const { userId } = selections;
    const {
      email,
      refreshToken,
      accessToken,
      organizationId,
      password,
      token,
      provider,
      username,
      confirmedAt,
      deletedAt,
    } = options;

    const user = this.client.user.update({
      where: {
        id: userId,
      },
      data: {
        email,
        refreshToken,
        accessToken,
        organizationId,
        password,
        token,
        provider,
        username,
        confirmedAt,
        deletedAt,
      },
    });

    return user;
  }
}
