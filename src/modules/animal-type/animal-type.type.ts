import { AnimalType } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type AnimalTypesSelections = {
  search?: string;
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
  name: true,
  icon: true,
};
