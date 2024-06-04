import { Fattening } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetFatteningsSelections = {
  search?: string;
  organizationId?: string;
  animalTypeId?: string;
  pagination?: PaginationType;
};

export type GetOneFatteningSelections = {
  animalId?: string;
  fatteningId?: Fattening['id'];
  animalTypeId?: Fattening['animalTypeId'];
  organizationId?: Fattening['organizationId'];
};

export type UpdateFatteningsSelections = {
  fatteningId: Fattening['id'];
};

export type CreateFatteningsOptions = Partial<Fattening>;

export type UpdateFatteningsOptions = Partial<Fattening>;

export const fatteningsSelect = {
  createdAt: true,
  updatedAt: true,
  id: true,
  initialWeight: true,
  actualWeight: true,
  animalTypeId: true,
  animalType: {
    select: {
      icon: true,
      name: true,
    },
  },
  animalId: true,
  animal: {
    select: {
      code: true,
      animalTypeId: true,
      animalType: {
        select: {
          icon: true,
          name: true,
        },
      },
      status: true,
      gender: true,
      weight: true,
      electronicCode: true,
      productionPhase: true,
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
  userCreatedId: true,
  organizationId: true,
};
