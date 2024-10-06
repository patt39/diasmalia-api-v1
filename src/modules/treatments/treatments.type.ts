import { Treatment } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetTreatmentsSelections = {
  search?: string;
  periode?: number;
  animalId?: string;
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
  note: true,
  dose: true,
  name: true,
  method: true,
  diagnosis: true,
  animalId: true,
  animal: {
    select: {
      code: true,
      status: true,
      productionPhase: true,
    },
  },
  animalTypeId: true,
  animalType: {
    select: {
      name: true,
    },
  },
  healthId: true,
  health: {
    select: {
      name: true,
    },
  },
  organizationId: true,
  organization: {
    select: {
      name: true,
    },
  },
};
