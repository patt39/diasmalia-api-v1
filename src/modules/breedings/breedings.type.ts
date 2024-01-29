import { Breeding } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetBreedingsSelections = {
  search?: string;
  organizationId: string;
  pagination?: PaginationType;
};

export type GetOneBreedingsSelections = {
  breedingId: Breeding['id'];
  checkStatus: Breeding['checkStatus'];
  organizationId?: Breeding['organizationId'];
};

export type UpdateBreedingsSelections = {
  breedingId: Breeding['id'];
};

export type CreateBreedingsOptions = Partial<Breeding>;

export type UpdateBreedingsOptions = Partial<Breeding>;

export const BreedingSelect = {
  createdAt: true,
  id: true,
  date: true,
  note: true,
  animalFemaleId: true,
  animalMaleId: true,
  method: true,
  checkStatus: true,
  organizationId: true,
  organization: {
    select: {
      name: true,
    },
  },
};
