import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { DatabaseService } from '../../app/database/database.service';
import {
  CreateUsersOptions,
  GetOneUsersSelections,
  UpdateUsersOptions,
  UpdateUsersSelections,
} from './users.type';

@Injectable()
export class UsersService {
  constructor(private readonly client: DatabaseService) {}

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
      include: { profile: true, organization: true },
    });

    return user;
  }

  /** Create one Users to the database. */
  async createOne(options: CreateUsersOptions): Promise<User> {
    const {
      email,
      token,
      provider,
      username,
      password,
      organizationId,
      confirmedAt,
    } = options;

    const user = this.client.user.create({
      data: {
        email,
        token,
        password,
        provider,
        username,
        organizationId,
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
