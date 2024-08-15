import { Sale } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetSalesSelections = {
  search?: string;
  periode?: number;
  organizationId: string;
  pagination?: PaginationType;
  method?: Sale['method'];
  type?: Sale['type'];
  detail?: Sale['detail'];
  animalTypeId?: string;
};

export type GetOneSaleSelections = {
  saleId?: Sale['id'];
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
  price: true,
  soldTo: true,
  type: true,
  phone: true,
  note: true,
  detail: true,
  email: true,
  number: true,
  method: true,
  address: true,
  animalId: true,
};
