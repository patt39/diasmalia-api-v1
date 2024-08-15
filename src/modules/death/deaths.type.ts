import { Death } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetDeathsSelections = {
  search?: string;
  organizationId?: string;
  animalTypeId?: string;
  periode?: number;
  pagination?: PaginationType;
};

export type GetOneDeathSelections = {
  deathId?: Death['id'];
  animalTypeId?: Death['animalTypeId'];
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
  note: true,
  number: true,
  animalId: true,
  animal: {
    select: {
      code: true,
      quantity: true,
    },
  },
  animalTypeId: true,
  animalType: {
    select: {
      name: true,
    },
  },
  organizationId: true,
  organization: {
    select: {
      name: true,
    },
  },
  userCreatedId: true,
};
