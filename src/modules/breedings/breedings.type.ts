import { Animal, Breeding } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetBreedingsSelections = {
  search?: string;
  organizationId?: string;
  pagination?: PaginationType;
  animalId?: string;
  periode?: number;
  animalTypeId?: string;
  gender?: Animal['gender'];
  method?: Breeding['method'];
  checkStatus?: Breeding['checkStatus'];
};

export type GetOneBreedingsSelections = {
  animalId?: Animal['id'];
  gender?: Animal['gender'];
  breedingId?: Breeding['id'];
  checkStatus?: Breeding['checkStatus'];
  animalTypeId?: Animal['animalTypeId'];
  animalMaleId?: Breeding['animalMaleId'];
  animalFemaleId?: Breeding['animalFemaleId'];
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
  note: true,
  result: true,
  maleCode: true,
  femaleCode: true,
  animalFemaleId: true,
  animalMaleId: true,
  method: true,
  checkStatus: true,
  animalTypeId: true,
  animalType: {
    select: {
      name: true,
    },
  },
  organizationId: true,
  organization: {
    select: {
      name: true,
    },
  },
};
