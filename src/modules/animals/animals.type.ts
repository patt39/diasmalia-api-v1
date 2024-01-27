import { Animal } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetAnimalsSelections = {
  search?: string;
  organizationId: string;
  pagination?: PaginationType;
};

export type GetOneAnimalsSelections = {
  animalId?: Animal['id'];
  code?: Animal['code'];
  gender?: Animal['gender'];
  electronicCode?: Animal['electronicCode'];
  type?: Animal['type'];
  status?: Animal['status'];
  productionPhase?: Animal['productionPhase'];
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
  status: true,
  locationId: true,
  location: {
    select: {
      number: true,
    },
  },
  breedId: true,
};
