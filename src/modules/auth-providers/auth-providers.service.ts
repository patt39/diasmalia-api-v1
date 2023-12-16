import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateAuthProvidersOptions,
  GetOneAuthProvidersSelections,
  UpdateAuthProvidersOptions,
  UpdateAuthProvidersSelections,
} from './auth-providers.type';
import { DatabaseService } from '../../app/database/database.service';
import { AuthProvider, Prisma } from '@prisma/client';
import { useCatch } from '../../app/utils/use-catch';

@Injectable()
export class AuthProvidersService {
  constructor(private readonly client: DatabaseService) {}

  /** Find one AuthProviders to the database. */
  async findOneBy(selections: GetOneAuthProvidersSelections) {
    const prismaWhereAuthProvider = {} as Prisma.AuthProviderWhereInput;
    const { authProviderId, providerId } = selections;

    if (authProviderId) {
      Object.assign(prismaWhereAuthProvider, { id: authProviderId });
    }

    if (providerId) {
      Object.assign(prismaWhereAuthProvider, { providerId });
    }

    const authProvider = await this.client.authProvider.findFirstOrThrow({
      where: { ...prismaWhereAuthProvider, deletedAt: null },
    });

    return authProvider;
  }

  /** Create one AuthProviders to the database. */
  async createOne(options: CreateAuthProvidersOptions): Promise<AuthProvider> {
    const { name, email, providerId, userId } = options;

    const authProvider = this.client.authProvider.create({
      data: {
        name,
        email,
        providerId,
        userId,
      },
    });

    const [error, result] = await useCatch(authProvider);
    if (error) throw new NotFoundException(error);

    return result;
  }

  /** Update one AuthProviders to the database. */
  async updateOne(
    selections: UpdateAuthProvidersSelections,
    options: UpdateAuthProvidersOptions,
  ): Promise<AuthProvider> {
    const { authProviderId } = selections;
    const { deletedAt } = options;

    const AuthProvider = this.client.authProvider.update({
      where: {
        id: authProviderId,
      },
      data: {
        deletedAt,
      },
    });

    const [error, result] = await useCatch(AuthProvider);
    if (error) throw new NotFoundException(error);

    return result;
  }
}
