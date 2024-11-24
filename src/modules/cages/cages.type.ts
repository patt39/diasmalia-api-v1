import { Cage } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetCagesSelections = {
  search?: string;
  animalId?: string;
  organizationId?: string;
  pagination?: PaginationType;
};

export type GetOneCageSelections = {
  cageId: Cage['id'];
  organizationId?: string;
};

export type UpdateCagesSelections = {
  cageId: Cage['id'];
};

export type CreateCagesOptions = Partial<Cage>;

export type UpdateCagesOptions = Partial<Cage>;

export const cagesSelect = {
  createdAt: true,
  id: true,
  dimension: true,
  code: true,
  death: true,
  eggHarvested: true,
  numberPerCage: true,
  animalId: true,
  animal: {
    select: {
      code: true,
      quantity: true,
      locationId: true,
    },
  },
  animalTypeId: true,
  animalType: {
    select: { name: true },
  },
  userCreatedId: true,
  organizationId: true,
};
