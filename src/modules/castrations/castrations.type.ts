import { Castration } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetCastrationsSelections = {
  search?: string;
  method?: Castration['method'];
  organizationId?: string;
  animalTypeId?: string;
  pagination?: PaginationType;
};

export type GetOneCastrationsSelections = {
  castrationId?: Castration['id'];
  animalTypeId?: Castration['animalTypeId'];
  organizationId?: Castration['organizationId'];
};

export type UpdateCastrationsSelections = {
  castrationId: Castration['id'];
};

export type CreateCastrationsOptions = Partial<Castration>;

export type UpdateCastrationsOptions = Partial<Castration>;

export const castrationsSelect = {
  createdAt: true,
  id: true,
  date: true,
  note: true,
  method: true,
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
  userCreatedId: true,
  organizationId: true,
};
