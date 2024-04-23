import { Incubation } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type IncubationsSelections = {
  search?: string;
  organizationId?: string;
  animalTypeId?: string;
  pagination?: PaginationType;
};

export type GetOneIncubationSelections = {
  incubationId?: Incubation['id'];
  organizationId?: Incubation['id'];
  animalTypeId?: Incubation['animalTypeId'];
};

export type UpdateIncubationsSelections = {
  incubationId: Incubation['id'];
};

export type CreateEggHavestingsOptions = Partial<Incubation>;

export type UpdateIncubationsOptions = Partial<Incubation>;

export const IncubationsSelect = {
  createdAt: true,
  id: true,
  note: true,
  quantity: true,
  date: true,
  animalId: true,
  animal: {
    select: {
      quantity: true,
      weight: true,
      animalTypeId: true,
      animalType: {
        select: {
          icon: true,
          name: true,
        },
      },
      location: {
        select: {
          number: true,
        },
      },
    },
  },
  organizationId: true,
  organization: {
    select: {
      date: true,
      name: true,
    },
  },
  animalTypeId: true,
  animalType: {
    select: {
      icon: true,
      name: true,
    },
  },
  userCreatedId: true,
};
