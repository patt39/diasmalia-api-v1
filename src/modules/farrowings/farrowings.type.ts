import { Farrowing } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetFarrowingsSelections = {
  search?: string;
  periode?: number;
  organizationId?: string;
  animalTypeId?: string;
  pagination?: PaginationType;
};

export type GetOneFarrowingsSelections = {
  farrowingId?: Farrowing['id'];
  animalId?: Farrowing['animalId'];
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
  litter: true,
  note: true,
  animalId: true,
  animal: {
    select: {
      code: true,
    },
  },
  animalTypeId: true,
  animalType: {
    select: {
      name: true,
    },
  },
};
