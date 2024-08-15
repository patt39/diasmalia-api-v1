import { CheckPregnancy } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetCheckPregnanciesSelections = {
  search?: string;
  organizationId: string;
  pagination?: PaginationType;
  animalTypeId?: string;
  result?: CheckPregnancy['result'];
};

export type GetOneCheckPregnanciesSelections = {
  checkPregnancyId?: CheckPregnancy['id'];
  result?: CheckPregnancy['result'];
  animalId?: CheckPregnancy['animalId'];
  animalTypeId?: CheckPregnancy['animalTypeId'];
  organizationId?: CheckPregnancy['organizationId'];
};

export type UpdateCheckPregnanciesSelections = {
  checkPregnancyId: CheckPregnancy['id'];
};

export type CreateCheckPregnanciesOptions = Partial<CheckPregnancy>;

export type UpdateCheckPregnanciesOptions = Partial<CheckPregnancy>;

export const CheckPregnancySelect = {
  createdAt: true,
  id: true,
  result: true,
  organizationId: true,
  organization: {
    select: {
      name: true,
    },
  },
};
