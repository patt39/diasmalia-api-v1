import { Finance, financeType } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetFinancesSelections = {
  search?: string;
  type?: financeType;
  organizationId?: string;
  pagination?: PaginationType;
};

export type GetOneFinanceSelections = {
  financeId?: Finance['id'];
  slug?: string;
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
  slug: true,
  amount: true,
  type: true,
  detail: true,
};
