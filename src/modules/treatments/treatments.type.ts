import { Treatment } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetTreatmentsSelections = {
  search?: string;
  organizationId: string;
  pagination?: PaginationType;
};

export type GetOneTreatmentsSelections = {
  treatmentId?: Treatment['id'];
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
  diagnosis: true,
  batchId: true,
  animal: {
    select: {
      weight: true,
      type: true,
      location: {
        select: {
          number: true,
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
  userCreatedId: true,
};
