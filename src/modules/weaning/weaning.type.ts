import { Weaning } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetWeaningsSelections = {
  search?: string;
  periode?: number;
  organizationId?: string;
  animalTypeId?: string;
  pagination?: PaginationType;
};

export type GetOneWeaningSelections = {
  weaningId?: Weaning['id'];
  organizationId?: Weaning['id'];
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
  litter: true,
  animalId: true,
  animal: {
    select: {
      code: true,
      status: true,
      gender: true,
      weight: true,
      electronicCode: true,
      productionPhase: true,
    },
  },
  farrowingId: true,
  farrowing: {
    select: {
      litter: true,
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
