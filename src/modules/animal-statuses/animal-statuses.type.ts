import { AnimalStatus } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetAnimalStatusesSelections = {
  search?: string;
  organizationId: string;
  pagination?: PaginationType;
};

export type GetOneAnimalStatusSelections = {
  animalStatusId: AnimalStatus['id'];
};

export type UpdateAnimalStatusesSelections = {
  animalStatusId: AnimalStatus['id'];
};

export type CreateAnimalStatusesOptions = Partial<AnimalStatus>;

export type UpdateAnimalStatusesOptions = Partial<AnimalStatus>;

export const AnimalStatusSelect = {
  createdAt: true,
  id: true,
  title: true,
  color: true,
};
