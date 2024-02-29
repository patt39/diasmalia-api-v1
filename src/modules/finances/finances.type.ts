import { Finance } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetFinancesSelections = {
  search?: string;
  organizationId: string;
  pagination?: PaginationType;
};

export type GetOneFinanceSelections = {
  financeId?: Finance['id'];
  organizationId?: Finance['organizationId'];
};

export type UpdateFinancesSelections = {
  financeId: Finance['id'];
};

export type CreateFinanceOptions = Partial<Finance>;

export type UpdateFinancesOptions = Partial<Finance>;

export const FinancesSelect = {
  createdAt: true,
  id: true,
  date: true,
  note: true,
  amount: true,
  type: true,
  details: true,
  userCreatedId: true,
  organizationId: true,
};
