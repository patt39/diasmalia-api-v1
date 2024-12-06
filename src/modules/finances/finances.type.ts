import { Finance } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetFinancesSelections = {
  search?: string;
  type?: string;
  periode?: number;
  days?: string;
  months?: string;
  year?: string;
  animalId?: string;
  animalTypeId?: string;
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
  amount: true,
  type: true,
  detail: true,
  animalId: true,
  animal: {
    select: {
      code: true,
    },
  },
  animalTypeId: true,
  animalType: {
    select: {
      name: true,
    },
  },
};
