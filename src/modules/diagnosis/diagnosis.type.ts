import { Diagnosis } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetDiagnosisSelections = {
  search?: string;
  organizationId: string;
  pagination?: PaginationType;
};

export type GetOneDiagnosisSelections = {
  diagnosisId?: Diagnosis['id'];
  organizationId?: Diagnosis['organizationId'];
};

export type UpdateDiagnosisSelections = {
  diagnosisId: Diagnosis['id'];
};

export type CreateDiagnosisOptions = Partial<Diagnosis>;

export type UpdateDiagnosisOptions = Partial<Diagnosis>;

export const DiagnosisSelect = {
  createdAt: true,
  id: true,
  name: true,
  organizationId: true,
  organization: {
    select: {
      name: true,
    },
  },
  _count: {
    select: {
      treatments: true,
    },
  },
};
