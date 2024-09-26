import { AnimalType, AnimalTypeStatus } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type AnimalTypesSelections = {
  search?: string;
  status?: AnimalTypeStatus;
  pagination?: PaginationType;
};

export type GetOneAnimalTypeSelections = {
  name?: string;
  animalTypeId?: AnimalType['id'];
};

export type UpdateAnimalTypesSelections = {
  animalTypeId: AnimalType['id'];
};

export type CreateAnimalTypesOptions = Partial<AnimalType>;

export type UpdateAnimalTypesOptions = Partial<AnimalType>;

export const AnimalTypesSelect = {
  createdAt: true,
  id: true,
  tab: true,
  name: true,
  photo: true,
  status: true,
  slug: true,
  habitat: true,
  description: true,
  _count: {
    select: {
      eggHavestings: true,
      incubations: true,
      feedings: true,
      deaths: true,
      sales: true,
    },
  },
};
