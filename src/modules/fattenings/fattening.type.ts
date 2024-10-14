import { Fattening } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetFatteningsSelections = {
  search?: string;
  periode?: number;
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
      name: true,
    },
  },
  animalId: true,
  animal: {
    select: {
      id: true,
      code: true,
      weight: true,
      status: true,
      productionPhase: true,
    },
  },
};
