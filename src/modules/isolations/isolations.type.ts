import { Isolation } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetIsolationsSelections = {
  search?: string;
  periode?: number;
  organizationId?: string;
  animalTypeId?: string;
  pagination?: PaginationType;
};

export type GetOneIsolationsSelections = {
  isolationId?: Isolation['id'];
  animalId?: Isolation['animalId'];
  animalTypeId?: Isolation['animalTypeId'];
  organizationId?: Isolation['id'];
  deletedAt?: Isolation['deletedAt'];
};

export type UpdateIsolationsSelections = {
  isolationId: Isolation['id'];
};

export type CreateIsolationsOptions = Partial<Isolation>;

export type UpdateIsolationsOptions = Partial<Isolation>;

export const IsolationsSelect = {
  createdAt: true,
  id: true,
  note: true,
  male: true,
  female: true,
  number: true,
  animal: {
    select: {
      id: true,
      code: true,
      male: true,
      status: true,
      female: true,
      quantity: true,
      productionPhase: true,
    },
  },
  animalType: {
    select: {
      name: true,
    },
  },
};
