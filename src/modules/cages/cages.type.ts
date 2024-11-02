import { Cage } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetCagesSelections = {
  search?: string;
  pagination?: PaginationType;
};

export type GetOneCageSelections = {
  cageId: Cage['id'];
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
  animalId: true,
  animal: {
    select: {
      code: true,
      select: {
        location: {
          select: { cages: true },
        },
      },
    },
  },
  animalTypeId: true,
  animalType: {
    select: { name: true },
  },
  userCreatedId: true,
  organizationId: true,
};
