import { Account } from '@prisma/client';

export type GetOneAccountSelections = {
  accountId?: Account['id'];
  incomeAmount?: Account['incomeAmount'];
  organizationId?: Account['organizationId'];
  expenditureAmount?: Account['expenditureAmount'];
};

export type CreateAccountOptions = Partial<Account>;

export type UpdateAccountOptions = Partial<Account>;

export type UpdateAccountSelections = {
  accountId: Account['id'];
};
