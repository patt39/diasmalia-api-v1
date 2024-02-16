import { FinancialMgt } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetFinancialMgtSelections = {
  search?: string;
  organizationId: string;
  pagination?: PaginationType;
};

export type GetOneFinancialMgtSelections = {
  financialMgtId?: FinancialMgt['id'];
  organizationId?: FinancialMgt['organizationId'];
};

export type UpdateFinancialMgtSelections = {
  financialMgtId: FinancialMgt['id'];
};

export type CreateFinancialMgtOptions = Partial<FinancialMgt>;

export type UpdateFinancialMgtOptions = Partial<FinancialMgt>;

export const FinancialMgtSelect = {
  createdAt: true,
  id: true,
  date: true,
  note: true,
  amount: true,
  type: true,
  financialDetailId: true,
  userCreatedId: true,
  organizationId: true,
};
