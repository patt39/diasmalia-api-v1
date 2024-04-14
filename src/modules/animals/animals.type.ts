import { Animal } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetAnimalsSelections = {
  search?: string;
  organizationId?: string;
  pagination?: PaginationType;
  animalIds?: string[];
  code?: Animal['code'];
  status?: Animal['status'];
  animalTypeId?: Animal['animalTypeId'];
  gender?: Animal['gender'];
  productionPhase?: Animal['productionPhase'];
};

export type GetOneAnimalsSelections = {
  animalId?: Animal['id'];
  code?: Animal['code'];
  gender?: Animal['gender'];
  electronicCode?: Animal['electronicCode'];
  animalTypeId?: Animal['animalTypeId'];
  isCastrated?: 'TRUE' | 'FALSE';
  isIsolated?: 'TRUE' | 'FALSE';
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
  type: true,
  gender: true,
  weight: true,
  status: true,
  birthday: true,
  codeFather: true,
  codeMother: true,
  productionPhase: true,
  electronicCode: true,
  locationId: true,
  organizationId: true,
  organization: {
    select: {
      logo: true,
      name: true,
      image: true,
    },
  },
  location: {
    select: {
      code: true,
      type: true,
      productionPhase: true,
    },
  },
  breedId: true,
  breed: {
    select: {
      name: true,
    },
  },
  _count: {
    select: {
      milkings: true,
      weanings: true,
      gestations: true,
      farrowings: true,
      treatments: true,
    },
  },
};
