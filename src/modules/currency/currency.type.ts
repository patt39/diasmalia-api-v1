import { Currency } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetCurrencySelections = {
  search?: string;
  status?: string;
  pagination?: PaginationType;
};

export type GetOneCurrencySelections = {
  currencyId?: Currency['id'];
  organizationId?: string;
  code?: string;
  status?: boolean;
};

export type UpdateCurrenciesSelections = {
  currencyId: Currency['id'];
};

export type CreateCurrenciesOptions = Partial<Currency>;

export type UpdateCurrenciesOptions = Partial<Currency>;

export const currenciesSelect = {
  createdAt: true,
  id: true,
  name: true,
  code: true,
  symbol: true,
  status: true,
};
