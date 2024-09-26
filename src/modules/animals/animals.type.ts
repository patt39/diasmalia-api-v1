import { Animal, AnimalStatus } from '@prisma/client';
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
  locationId?: Animal['locationId'];
  deletedAt?: Animal['deletedAt'];
  animalTypeId?: Animal['animalTypeId'];
  productionPhase?: Animal['productionPhase'];
};

export type GetOneAnimalsSelections = {
  animalId?: Animal['id'];
  code?: Animal['code'];
  gender?: Animal['gender'];
  quantity?: Animal['quantity'];
  animalTypeId?: Animal['animalTypeId'];
  isIsolated?: Animal['isIsolated'];
  isCastrated?: Animal['isCastrated'];
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
  deletedAt: true,
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
  eggHarvestedCount: true,
  productionPhase: true,
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
      _count: {
        select: {
          animals: {
            where: {
              deletedAt: null,
              status: 'ACTIVE' as AnimalStatus,
            },
          },
        },
      },
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
      eggHavestings: true,
      incubations: true,
      treatments: true,
      feedings: true,
      sales: true,
    },
  },
};
