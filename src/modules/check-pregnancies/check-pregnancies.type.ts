import { CheckPregnancy } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetCheckPregnanciesSelections = {
  search?: string;
  organizationId: string;
  pagination?: PaginationType;
};

export type GetOneCheckPregnanciesSelections = {
  checkPregnancyId: CheckPregnancy['id'];
};

export type UpdateCheckPregnanciesSelections = {
  checkPregnancyId: CheckPregnancy['id'];
};

export type CreateCheckPregnanciesOptions = Partial<CheckPregnancy>;

export type UpdateCheckPregnanciesOptions = Partial<CheckPregnancy>;

export const CheckPregnancySelect = {
  createdAt: true,
  id: true,
  date: true,
  note: true,
  method: true,
  result: true,
  farrowingDate: true,
  organizationId: true,
};
