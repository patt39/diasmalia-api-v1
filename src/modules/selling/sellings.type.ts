import { Selling } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetSellingsSelections = {
  search?: string;
  organizationId: string;
  pagination?: PaginationType;
  method: Selling['method'];
};

export type GetOneSellingSelections = {
  sellingId: Selling['id'];
  organizationId?: Selling['organizationId'];
};

export type UpdateSellingsSelections = {
  sellingId: Selling['id'];
};

export type CreateSellingsOptions = Partial<Selling>;

export type UpdateSellingsOptions = Partial<Selling>;

export const SellingSelect = {
  createdAt: true,
  id: true,
  date: true,
  price: true,
  soldTo: true,
  animalId: true,
  method: true,
  organizationId: true,
  userCreatedId: true,
  phone: true,
  note: true,
};
