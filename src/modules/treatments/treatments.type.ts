import { Treatment } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetTreatmentsSelections = {
  search?: string;
  organizationId?: string;
  animalTypeId?: string;
  pagination?: PaginationType;
};

export type GetOneTreatmentsSelections = {
  treatmentId?: Treatment['id'];
  animalTypeId?: Treatment['animalTypeId'];
  organizationId?: Treatment['organizationId'];
};

export type UpdateTreatmentsSelections = {
  treatmentId: Treatment['id'];
};

export type CreateTreatmentsOptions = Partial<Treatment>;

export type UpdateTreatmentsOptions = Partial<Treatment>;

export const TreatmentSelect = {
  createdAt: true,
  id: true,
  method: true,
  note: true,
  dose: true,
  name: true,
  date: true,
  medication: true,
  diagnosis: true,
  animalId: true,
  animal: {
    select: {
      code: true,
      productionPhase: true,
      weight: true,
      electronicCode: true,
      status: true,
      gender: true,
      animalTypeId: true,
      animalType: {
        select: {
          icon: true,
          name: true,
        },
      },
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
  organizationId: true,
  organization: {
    select: {
      name: true,
    },
  },
  userCreatedId: true,
};
