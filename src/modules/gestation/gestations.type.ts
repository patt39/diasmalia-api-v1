import { Gestation } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetGestationsSelections = {
  search?: string;
  periode?: number;
  organizationId: string;
  animalTypeId?: string;
  pagination?: PaginationType;
};

export type GetOneGestationSelections = {
  gestationId?: Gestation['id'];
  animalId?: Gestation['animalId'];
  organizationId?: Gestation['organizationId'];
  checkPregnancyId?: Gestation['checkPregnancyId'];
  animalTypeId?: Gestation['animalTypeId'];
};

export type UpdateGestationsSelections = {
  gestationId: Gestation['id'];
};

export type CreateGestationsOptions = Partial<Gestation>;

export type UpdateGestationsOptions = Partial<Gestation>;

export const GestationSelect = {
  createdAt: true,
  id: true,
  note: true,
  method: true,
  checkPregnancyId: true,
  farrowingDate: true,
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
  breedingId: true,
  breeding: {
    select: {
      checkStatus: true,
    },
  },
  organizationId: true,
  organization: {
    select: {
      name: true,
    },
  },
};
