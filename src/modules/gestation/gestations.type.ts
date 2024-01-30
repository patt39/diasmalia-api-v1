import { Gestation } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetGestationsSelections = {
  search?: string;
  organizationId: string;
  pagination?: PaginationType;
};

export type GetOneGestationSelections = {
  gestationId: Gestation['id'];
  organizationId: Gestation['id'];
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
  animal: {
    select: {
      code: true,
      productionPhase: true,
      weight: true,
      electronicCode: true,
      status: true,
      gender: true,
      type: true,
      location: {
        select: {
          number: true,
        },
      },
      breed: {
        select: {
          name: true,
        },
      },
    },
  },
  checkPregnancyId: true,
  checkPregnancy: {
    select: {
      farrowingDate: true,
    },
  },
  organizationId: true,
  organization: {
    select: {
      name: true,
    },
  },
  userCreatedId: true,
  note: true,
};
