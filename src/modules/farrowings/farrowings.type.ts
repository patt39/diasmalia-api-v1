import { Farrowing } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetFarrowingsSelections = {
  search?: string;
  organizationId?: string;
  animalTypeId?: string;
  pagination?: PaginationType;
};

export type GetOneFarrowingsSelections = {
  farrowingId?: Farrowing['id'];
  animalTypeId?: Farrowing['animalTypeId'];
  organizationId?: Farrowing['organizationId'];
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
          icon: true,
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
};
