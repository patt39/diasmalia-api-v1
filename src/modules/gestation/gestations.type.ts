import { Gestation } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetGestationsSelections = {
  search?: string;
  organizationId: string;
  animalTypeId?: string;
  pagination?: PaginationType;
};

export type GetOneGestationSelections = {
  gestationId?: Gestation['id'];
  animalId?: Gestation['animalId'];
  organizationId?: Gestation['id'];
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
  animalId: true,
  animal: {
    select: {
      code: true,
      productionPhase: true,
      weight: true,
      electronicCode: true,
      status: true,
      gender: true,
      animalTypeId: true,
      animalType: {
        select: {
          name: true,
        },
      },
      location: {
        select: {
          code: true,
        },
      },
      breed: {
        select: {
          name: true,
        },
      },
    },
  },
  animalTypeId: true,
  animalType: {
    select: {
      icon: true,
      name: true,
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
