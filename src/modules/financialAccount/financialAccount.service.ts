import { Injectable } from '@nestjs/common';
import { FinancialAccount, Prisma } from '@prisma/client';
import { DatabaseService } from '../../app/database/database.service';
import {
  CreateFinancialAccountOptions,
  GetOneFinancialAccountSelections,
  UpdateFinancialAccountOptions,
  UpdateFinancialAccountSelections,
} from './financialAccount.type';

@Injectable()
export class FinancialAccountService {
  constructor(private readonly client: DatabaseService) {}

  /** Find one financialDetail database. */
  async findOneBy(selections: GetOneFinancialAccountSelections) {
    const prismaWhere = {} as Prisma.FinancialAccountWhereInput;
    const { expenditureAmount, incomeAmount, financialAccountId } = selections;

    if (financialAccountId) {
      Object.assign(prismaWhere, { id: financialAccountId });
    }

    if (expenditureAmount) {
      Object.assign(prismaWhere, { expenditureAmount });
    }

    if (incomeAmount) {
      Object.assign(prismaWhere, { incomeAmount });
    }

    const financialDetail = await this.client.financialAccount.findFirst({
      where: { ...prismaWhere, deletedAt: null },
    });

    return financialDetail;
  }

  /** Create one financialMgt database. */
  async createOne(
    options: CreateFinancialAccountOptions,
  ): Promise<FinancialAccount> {
    const { incomeAmount, expenditureAmount, organizationId, userCreatedId } =
      options;

    const financialAccount = this.client.financialAccount.create({
      data: {
        incomeAmount,
        expenditureAmount,
        organizationId,
        userCreatedId,
      },
    });

    return financialAccount;
  }

  /** Update one financialDetail in database. */
  async updateOne(
    selections: UpdateFinancialAccountSelections,
    options: UpdateFinancialAccountOptions,
  ): Promise<FinancialAccount> {
    const { financialAccountId } = selections;
    const { expenditureAmount, incomeAmount, deletedAt } = options;

    const financialAccount = this.client.financialAccount.update({
      where: {
        id: financialAccountId,
      },
      data: {
        incomeAmount,
        expenditureAmount,
        deletedAt,
      },
    });

    return financialAccount;
  }
}
