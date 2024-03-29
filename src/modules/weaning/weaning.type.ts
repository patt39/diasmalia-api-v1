import { Weaning } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetWeaningsSelections = {
  search?: string;
  organizationId: string;
  pagination?: PaginationType;
};

export type GetOneWeaningSelections = {
  weaningId?: Weaning['id'];
  organizationId?: Weaning['id'];
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
  note: true,
  date: true,
  animalId: true,
  animal: {
    select: {
      code: true,
      type: true,
      status: true,
      gender: true,
      weight: true,
      electronicCode: true,
      productionPhase: true,
      location: {
        select: {
          code: true,
        },
      },
      breed: {
        select: {
          name: true,
        },
      },
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
      date: true,
      name: true,
    },
  },
  userCreatedId: true,
};
