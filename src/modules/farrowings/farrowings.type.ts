import { Farrowing } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetFarrowingsSelections = {
  search?: string;
  organizationId: string;
  pagination?: PaginationType;
};

export type GetOneFarrowingsSelections = {
  farrowingId: Farrowing['id'];
};

export type UpdateFarrowingsSelections = {
  farrowingId: Farrowing['id'];
};

export type CreateFarrowingsOptions = Partial<Farrowing>;

export type UpdateFarrowingsOptions = Partial<Farrowing>;

export const FarrowingSelect = {
  createdAt: true,
  id: true,
  litter: true,
  note: true,
  date: true,
  organizationId: true,
  userCreatedId: true,
  animalId: true,
  checkPregnancyId: true,
};
