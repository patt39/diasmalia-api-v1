import { Castration } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetCastrationsSelections = {
  search?: string;
  organizationId?: string;
  pagination?: PaginationType;
};

export type GetOneCastrationsSelections = {
  castrationId?: Castration['id'];
  organizationId?: Castration['id'];
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
  userCreatedId: true,
  organizationId: true,
};
