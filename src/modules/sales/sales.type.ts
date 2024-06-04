import { Sale } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetSalesSelections = {
  search?: string;
  organizationId: string;
  pagination?: PaginationType;
  method?: Sale['method'];
  type?: Sale['type'];
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
  date: true,
  price: true,
  soldTo: true,
  type: true,
  phone: true,
  note: true,
  email: true,
  quantity: true,
  method: true,
  organizationId: true,
  organization: {
    select: {
      name: true,
      logo: true,
    },
  },
  assigneTypeId: true,
  assigneType: {
    select: {
      animalTypeId: true,
      animalType: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  },
  userCreatedId: true,
};
