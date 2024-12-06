import { AnimalStatus, Weaning } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetWeaningsSelections = {
  search?: string;
  periode?: number;
  days?: string;
  months?: string;
  year?: string;
  organizationId?: string;
  animalTypeId?: string;
  pagination?: PaginationType;
};

export type GetOneWeaningSelections = {
  weaningId?: Weaning['id'];
  animalId?: Weaning['animalId'];
  organizationId?: Weaning['id'];
  breedingId?: Weaning['breedingId'];
  farrowingId?: Weaning['farrowingId'];
  animalTypeId?: Weaning['animalTypeId'];
};

export type UpdateWeaningsSelections = {
  weaningId: Weaning['id'];
};

export type CreateWeaningsOptions = Partial<Weaning>;

export type UpdateWeaningsOptions = Partial<Weaning>;

export const WeaningSelect = {
  createdAt: true,
  id: true,
  weight: true,
  litter: true,
  animalId: true,
  animal: {
    select: {
      code: true,
      status: true,
      gender: true,
      weight: true,
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
    },
  },
  farrowingId: true,
  farrowing: {
    select: {
      createdAt: true,
      litter: true,
      note: true,
      dead: true,
      weight: true,
    },
  },
  organizationId: true,
  organization: {
    select: {
      name: true,
    },
  },
  animalType: {
    select: {
      name: true,
    },
  },
};
