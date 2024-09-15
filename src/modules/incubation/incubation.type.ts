import { Incubation } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type IncubationsSelections = {
  search?: string;
  periode?: number;
  organizationId?: string;
  animalTypeId?: string;
  pagination?: PaginationType;
};

export type GetOneIncubationSelections = {
  incubationId?: Incubation['id'];
  animalId?: Incubation['animalId'];
  organizationId?: Incubation['organizationId'];
  animalTypeId?: Incubation['animalTypeId'];
};

export type UpdateIncubationsSelections = {
  incubationId: Incubation['id'];
};

export type CreateIncubationsOptions = Partial<Incubation>;

export type UpdateIncubationsOptions = Partial<Incubation>;

export const IncubationsSelect = {
  createdAt: true,
  id: true,
  dueDate: true,
  quantityStart: true,
  quantityEnd: true,
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
      productionPhase: true,
    },
  },
};
