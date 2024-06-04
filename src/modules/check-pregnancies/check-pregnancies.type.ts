import { CheckPregnancy } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetCheckPregnanciesSelections = {
  search?: string;
  organizationId: string;
  pagination?: PaginationType;
  animalTypeId?: string;
  method?: CheckPregnancy['method'];
  result?: CheckPregnancy['result'];
};

export type GetOneCheckPregnanciesSelections = {
  checkPregnancyId?: CheckPregnancy['id'];
  result?: CheckPregnancy['result'];
  animalId?: CheckPregnancy['animalId'];
  breedingId?: CheckPregnancy['breedingId'];
  animalTypeId?: CheckPregnancy['animalTypeId'];
  organizationId?: CheckPregnancy['organizationId'];
};

export type UpdateCheckPregnanciesSelections = {
  checkPregnancyId: CheckPregnancy['id'];
};

export type CreateCheckPregnanciesOptions = Partial<CheckPregnancy>;

export type UpdateCheckPregnanciesOptions = Partial<CheckPregnancy>;

export const CheckPregnancySelect = {
  createdAt: true,
  id: true,
  date: true,
  method: true,
  result: true,
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
  organizationId: true,
  organization: {
    select: {
      name: true,
    },
  },
  breedingId: true,
  breeding: {
    select: {
      animalFemaleId: true,
      date: true,
      method: true,
      checkStatus: true,
    },
  },
  animalTypeId: true,
  animalType: {
    select: {
      icon: true,
      name: true,
    },
  },
};
