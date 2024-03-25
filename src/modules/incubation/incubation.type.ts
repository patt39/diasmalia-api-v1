import { Incubation } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type IncubationsSelections = {
  search?: string;
  organizationId: string;
  pagination?: PaginationType;
};

export type GetOneIncubationSelections = {
  incubationId?: Incubation['id'];
  organizationId?: Incubation['id'];
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
  size: true,
  quantity: true,
  date: true,
  batchId: true,
  animal: {
    select: {
      type: true,
      status: true,
      quantity: true,
      weight: true,
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
  userCreatedId: true,
};
