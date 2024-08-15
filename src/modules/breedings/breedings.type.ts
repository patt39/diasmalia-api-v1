import { Animal, Breeding } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetBreedingsSelections = {
  search?: string;
  organizationId?: string;
  pagination?: PaginationType;
  animalId?: string;
  animalTypeId?: string;
  gender?: Animal['gender'];
  method?: Breeding['method'];
  checkStatus?: Breeding['checkStatus'];
};

export type GetOneBreedingsSelections = {
  breedingId?: Breeding['id'];
  checkStatus?: Breeding['checkStatus'];
  animalId?: Animal['id'];
  animalTypeId?: Animal['animalTypeId'];
  gender?: Animal['gender'];
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
