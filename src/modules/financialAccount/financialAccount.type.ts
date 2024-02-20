import { FinancialAccount } from '@prisma/client';

export type GetOneFinancialAccountSelections = {
  financialAccountId?: FinancialAccount['id'];
  incomeAmount?: FinancialAccount['incomeAmount'];
  organizationId?: FinancialAccount['organizationId'];
  expenditureAmount?: FinancialAccount['expenditureAmount'];
};

export type UpdateFinancialAccountSelections = {
  financialAccountId: FinancialAccount['id'];
  incomeAmount?: FinancialAccount['incomeAmount'];
  expenditureAmount?: FinancialAccount['expenditureAmount'];
};

export type UpdateFinancialAccountOptions = Partial<FinancialAccount>;

export type CreateFinancialAccountOptions = Partial<FinancialAccount>;
