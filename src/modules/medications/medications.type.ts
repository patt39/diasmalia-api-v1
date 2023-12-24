import { Medication } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetMedicationsSelections = {
  search?: string;
  organizationId: string;
  pagination?: PaginationType;
};

export type GetOneMedicationsSelections = {
  medicationId: Medication['id'];
};

export type UpdateMedicationsSelections = {
  medicationId: Medication['id'];
};

export type CreateMedicationsOptions = Partial<Medication>;

export type UpdateMedicationsOptions = Partial<Medication>;

export const MedicationSelect = {
  createdAt: true,
  id: true,
  name: true,
  organizationId: true,
};
