import { Treatment } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetTreatmentsSelections = {
  search?: string;
  organizationId: string;
  pagination?: PaginationType;
};

export type GetOneTreatmentsSelections = {
  treatmentId: Treatment['id'];
};

export type UpdateTreatmentsSelections = {
  treatmentId: Treatment['id'];
};

export type CreateTreatmentsOptions = Partial<Treatment>;

export type UpdateTreatmentsOptions = Partial<Treatment>;

export const TreatmentSelect = {
  createdAt: true,
  id: true,
  numberOfDose: true,
  treatmentName: true,
  treatmentDate: true,
  medicationId: true,
  note: true,
  diagnosisId: true,
  animalId: true,
  organizationId: true,
  userCreatedId: true,
};
