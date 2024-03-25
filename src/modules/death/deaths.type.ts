import { Death } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetDeathsSelections = {
  search?: string;
  organizationId: string;
  pagination?: PaginationType;
};

export type GetOneDeathSelections = {
  deathId?: Death['id'];
  organizationId?: Death['organizationId'];
};

export type UpdateDeathsSelections = {
  deathId: Death['id'];
};

export type CreateDeathsOptions = Partial<Death>;

export type UpdateDeathsOptions = Partial<Death>;

export const DeathSelect = {
  createdAt: true,
  id: true,
  date: true,
  note: true,
  batchId: true,
  batch: {
    select: {
      type: true,
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
  userCreatedId: true,
};
