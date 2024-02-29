import { Injectable } from '@nestjs/common';
import { Account, Prisma } from '@prisma/client';
import { DatabaseService } from '../../app/database/database.service';
import {
  CreateAccountOptions,
  GetOneAccountSelections,
  UpdateAccountOptions,
  UpdateAccountSelections,
} from './account.type';

@Injectable()
export class AccountService {
  constructor(private readonly client: DatabaseService) {}

  /** Find Account database. */
  async findOneBy(selections: GetOneAccountSelections) {
    const prismaWhere = {} as Prisma.AccountWhereInput;
    const { expenditureAmount, incomeAmount, accountId } = selections;

    if (accountId) {
      Object.assign(prismaWhere, { id: accountId });
    }

    if (expenditureAmount) {
      Object.assign(prismaWhere, { expenditureAmount });
    }

    if (incomeAmount) {
      Object.assign(prismaWhere, { incomeAmount });
    }

    const account = await this.client.account.findFirst({
      where: { ...prismaWhere, deletedAt: null },
    });

    return account;
  }

  /** Create Account database. */
  async createOne(options: CreateAccountOptions): Promise<Account> {
    const { incomeAmount, expenditureAmount, organizationId, userCreatedId } =
      options;

    const financialAccount = this.client.account.create({
      data: {
        incomeAmount,
        expenditureAmount,
        organizationId,
        userCreatedId,
      },
    });

    return financialAccount;
  }

  /** Update Account in database. */
  async updateOne(
    selections: UpdateAccountSelections,
    options: UpdateAccountOptions,
  ): Promise<Account> {
    const { accountId } = selections;
    const { incomeAmount, expenditureAmount, deletedAt } = options;

    const account = this.client.account.update({
      where: {
        id: accountId,
      },
      data: {
        incomeAmount,
        expenditureAmount,
        deletedAt,
      },
    });

    return account;
  }
}
