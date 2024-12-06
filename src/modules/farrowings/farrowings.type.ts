import { AnimalStatus, Farrowing } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetFarrowingsSelections = {
  months?: string;
  year?: string;
  days?: string;
  search?: string;
  periode?: number;
  animalId?: string;
  organizationId?: string;
  animalTypeId?: string;
  pagination?: PaginationType;
};

export type GetOneFarrowingsSelections = {
  farrowingId?: Farrowing['id'];
  animalId?: Farrowing['animalId'];
  createdAt?: Farrowing['createdAt'];
  breedingId?: Farrowing['breedingId'];
  animalTypeId?: Farrowing['animalTypeId'];
  organizationId?: Farrowing['organizationId'];
};

export type UpdateFarrowingsSelections = {
  farrowingId: Farrowing['id'];
};

export type CreateFarrowingsOptions = Partial<Farrowing>;

export type UpdateFarrowingsOptions = Partial<Farrowing>;

export const FarrowingSelect = {
  createdAt: true,
  id: true,
  image: true,
  dead: true,
  weight: true,
  litter: true,
  note: true,
  breedingId: true,
  farrowingDate: true,
  animalId: true,
  animal: {
    select: {
      code: true,
      status: true,
      productionPhase: true,
      location: {
        select: {
          id: true,
          code: true,
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
      breed: {
        select: {
          name: true,
        },
      },
    },
  },
  animalTypeId: true,
  animalType: {
    select: {
      name: true,
    },
  },
};
