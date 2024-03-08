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
  phone: true,
  note: true,
  animalId: true,
  animal: {
    select: {
      code: true,
      photo: true,
      type: true,
      status: true,
      gender: true,
      weight: true,
      electronicCode: true,
      productionPhase: true,
      breed: {
        select: {
          name: true,
        },
      },
    },
  },
  method: true,
  organizationId: true,
  organization: {
    select: {
      name: true,
      logo: true,
    },
  },
  userCreatedId: true,
};
