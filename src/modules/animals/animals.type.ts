import { Animal } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetAnimalsSelections = {
  search?: string;
  organizationId: string;
  pagination?: PaginationType;
};

export type GetOneAnimalsSelections = {
  animalId?: Animal['id'];
  organizationId?: Animal['organizationId'];
};

export type UpdateAnimalsSelections = {
  animalId: Animal['id'];
};

export type CreateAnimalsOptions = Partial<Animal>;

export type UpdateAnimalsOptions = Partial<Animal>;

export const AnimalSelect = {
  createdAt: true,
  id: true,
  code: true,
  codeFather: true,
  codeMother: true,
  birthday: true,
  weight: true,
  type: true,
  gender: true,
  productionPhase: true,
  electronicCode: true,
  animalStatusId: true,
  locationId: true,
  breedId: true,
};
