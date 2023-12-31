import { Weaning } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetWeaningsSelections = {
  search?: string;
  organizationId: string;
  pagination?: PaginationType;
};

export type GetOneWeaningSelections = {
  weaningId: Weaning['id'];
};

export type UpdateWeaningsSelections = {
  weaningId: Weaning['id'];
};

export type CreateWeaningsOptions = Partial<Weaning>;

export type UpdateWeaningsOptions = Partial<Weaning>;

export const WeaningSelect = {
  createdAt: true,
  id: true,
  litter: true,
  note: true,
  date: true,
  organizationId: true,
  userCreatedId: true,
  animalId: true,
};
