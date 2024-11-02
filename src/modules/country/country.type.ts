import { Country } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetCountriesSelections = {
  search?: string;
  pagination?: PaginationType;
};

export type GetOneCountrySelections = {
  countryId?: Country['id'];
  code?: string;
  status?: boolean;
};

export type UpdateCountriesSelections = {
  countryId: Country['id'];
};

export type CreateCountriesOptions = Partial<Country>;

export type UpdateCountriesOptions = Partial<Country>;

export const countriesSelect = {
  createdAt: true,
  id: true,
  name: true,
  code: true,
  status: true,
};
