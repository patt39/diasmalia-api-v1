import { EggHavesting } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetEggHavestingsSelections = {
  search?: string;
  periode?: number;
  organizationId?: string;
  animalTypeId?: string;
  pagination?: PaginationType;
};

export type GetOneEggHavestingSelections = {
  eggHarvestingId?: EggHavesting['id'];
  organizationId?: EggHavesting['organizationId'];
  animalTypeId?: EggHavesting['animalTypeId'];
};

export type UpdateEggHavestingsSelections = {
  eggHarvestingId: EggHavesting['id'];
};

export type CreateEggHavestingsOptions = Partial<EggHavesting>;

export type UpdateEggHavestingsOptions = Partial<EggHavesting>;

export const EggHarvestingsSelect = {
  createdAt: true,
  id: true,
  size: true,
  quantity: true,
  animalTypeId: true,
  animalType: {
    select: {
      name: true,
    },
  },
  animalId: true,
  animal: {
    select: {
      code: true,
    },
  },
  userCreatedId: true,
};
