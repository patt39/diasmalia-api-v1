import { EggHavesting } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetEggHavestingsSelections = {
  search?: string;
  organizationId: string;
  pagination?: PaginationType;
};

export type GetOneEggHavestingSelections = {
  eggHavestingId?: EggHavesting['id'];
  organizationId?: EggHavesting['id'];
};

export type UpdateEggHavestingsSelections = {
  eggHavestingId: EggHavesting['id'];
};

export type CreateEggHavestingsOptions = Partial<EggHavesting>;

export type UpdateEggHavestingsOptions = Partial<EggHavesting>;

export const EggHarvestingsSelect = {
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
