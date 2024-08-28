import { Animal } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetAnimalsSelections = {
  search?: string;
  organizationId?: string;
  pagination?: PaginationType;
  animalIds?: string[];
  code?: Animal['code'];
  status?: Animal['status'];
  gender?: Animal['gender'];
  isIsolated?: Animal['isIsolated'];
  animalTypeId?: Animal['animalTypeId'];
  productionPhase?: Animal['productionPhase'];
};

export type GetOneAnimalsSelections = {
  animalId?: Animal['id'];
  code?: Animal['code'];
  gender?: Animal['gender'];
  quantity?: Animal['quantity'];
  electronicCode?: Animal['electronicCode'];
  animalTypeId?: Animal['animalTypeId'];
  isIsolated?: Animal['isIsolated'];
  isCastrated?: Boolean;
  deletedAt?: Animal['deletedAt'];
  status?: Animal['status'];
  productionPhase?: Animal['productionPhase'];
  organizationId?: Animal['organizationId'];
  animalIds?: string[];
  pagination?: PaginationType;
};

export type UpdateAnimalsSelections = {
  animalId?: Animal['id'];
  code?: Animal['code'];
};

export type CreateAnimalsOptions = Partial<Animal>;

export type UpdateAnimalsOptions = Partial<Animal>;

export const AnimalSelect = {
  createdAt: true,
  id: true,
  code: true,
  gender: true,
  weight: true,
  status: true,
  male: true,
  female: true,
  quantity: true,
  birthday: true,
  codeFather: true,
  codeMother: true,
  isIsolated: true,
  isCastrated: true,
  productionPhase: true,
  electronicCode: true,
  organizationId: true,
  organization: {
    select: {
      logo: true,
      name: true,
      image: true,
    },
  },
  locationId: true,
  location: {
    select: {
      code: true,
      productionPhase: true,
    },
  },
  breedId: true,
  breed: {
    select: {
      name: true,
    },
  },
  animalTypeId: true,
  animalType: {
    select: {
      id: true,
      slug: true,
      photo: true,
      name: true,
    },
  },
  _count: {
    select: {
      treatments: true,
    },
  },
};
