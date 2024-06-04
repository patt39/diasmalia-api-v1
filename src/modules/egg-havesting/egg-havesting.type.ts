import { EggHavesting, PickingMethod, Size } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetEggHavestingsSelections = {
  search?: string;
  size?: Size;
  method?: PickingMethod;
  organizationId?: string;
  animalTypeId?: string;
  pagination?: PaginationType;
};

export type GetOneEggHavestingSelections = {
  eggHavestingId?: EggHavesting['id'];
  organizationId?: EggHavesting['id'];
  animalTypeId?: EggHavesting['animalTypeId'];
};

export type UpdateEggHavestingsSelections = {
  eggHavestingId: EggHavesting['id'];
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
      icon: true,
      name: true,
    },
  },
  animalId: true,
  animal: {
    select: {
      code: true,
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
