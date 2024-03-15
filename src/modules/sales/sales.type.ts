import { Sale } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetSalesSelections = {
  search?: string;
  organizationId: string;
  pagination?: PaginationType;
  method: Sale['method'];
  type: Sale['type'];
};

export type GetOneSaleSelections = {
  saleId?: Sale['id'];
  // animalId?: Sale['animalId'];
  organizationId?: Sale['organizationId'];
};

export type UpdateSalesSelections = {
  saleId: Sale['id'];
};

export type CreateSalesOptions = Partial<Sale>;

export type UpdateSalesOptions = Partial<Sale>;

export const SalesSelect = {
  createdAt: true,
  id: true,
  date: true,
  price: true,
  status: true,
  soldTo: true,
  phone: true,
  note: true,
  animalId: true,
  method: true,
  animals: true,
  organizationId: true,
  organization: {
    select: {
      name: true,
      logo: true,
    },
  },
  userCreatedId: true,
};
