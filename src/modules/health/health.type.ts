import { Health } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetHealthSelections = {
  search?: string;
  category?: string;
  status?: string;
  organizationId?: string;
  animalTypeId?: string;
  pagination?: PaginationType;
};

export type GetOneHealthSelections = {
  status?: string;
  name?: Health['name'];
  healthId?: Health['id'];
  animalTypeId?: Health['animalTypeId'];
  organizationId?: Health['organizationId'];
};

export type UpdateHealthSelections = {
  healthId: Health['id'];
};

export type CreateHealthsOptions = Partial<Health>;

export type UpdateHealthsOptions = Partial<Health>;

export const HealthSelect = {
  createdAt: true,
  id: true,
  name: true,
  image: true,
  status: true,
  category: true,
  description: true,
  animalTypeId: true,
  animalType: {
    select: {
      name: true,
    },
  },
};
