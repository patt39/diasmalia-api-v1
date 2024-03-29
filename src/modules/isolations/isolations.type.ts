import { Isolation } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetIsolationsSelections = {
  search?: string;
  organizationId?: string;
  pagination?: PaginationType;
};

export type GetOneIsolationsSelections = {
  isolationId?: Isolation['id'];
  organizationId?: Isolation['id'];
};

export type UpdateIsolationsSelections = {
  isolationId: Isolation['id'];
};

export type CreateIsolationsOptions = Partial<Isolation>;

export type UpdateIsolationsOptions = Partial<Isolation>;

export const isolationsSelect = {
  createdAt: true,
  id: true,
  date: true,
  note: true,
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
  userCreatedId: true,
  organizationId: true,
};
