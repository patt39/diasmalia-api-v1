import { Gestation } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetGestationsSelections = {
  search?: string;
  organizationId: string;
  pagination?: PaginationType;
};

export type GetOneGestationSelections = {
  gestationId: Gestation['id'];
};

export type UpdateGestationsSelections = {
  gestationId: Gestation['id'];
};

export type CreateGestationsOptions = Partial<Gestation>;

export type UpdateGestationsOptions = Partial<Gestation>;

export const GestationSelect = {
  createdAt: true,
  id: true,
  animalId: true,
  checkPregnancyId: true,
  organizationId: true,
  userCreatedId: true,
  note: true,
};
