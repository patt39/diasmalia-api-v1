import { Isolation } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetIsolationsSelections = {
  search?: string;
  organizationId?: string;
  animalTypeId?: string;
  pagination?: PaginationType;
};

export type GetOneIsolationsSelections = {
  isolationId?: Isolation['id'];
  animalTypeId?: Isolation['animalTypeId'];
  organizationId?: Isolation['id'];
};

export type UpdateIsolationsSelections = {
  isolationId: Isolation['id'];
};

export type CreateIsolationsOptions = Partial<Isolation>;

export type UpdateIsolationsOptions = Partial<Isolation>;

export const IsolationsSelect = {
  createdAt: true,
  id: true,
  date: true,
  note: true,
  animalId: true,
  animal: {
    select: {
      code: true,
      isIsolated: true,
      animalTypeId: true,
      animalType: {
        select: {
          icon: true,
          name: true,
        },
      },
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
  animalTypeId: true,
  animalType: {
    select: {
      icon: true,
      name: true,
    },
  },
  userCreatedId: true,
  organizationId: true,
};
