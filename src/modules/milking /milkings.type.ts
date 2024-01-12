import { Milking } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetMilkingsSelections = {
  search?: string;
  organizationId: string;
  pagination?: PaginationType;
};

export type GetOneMilkingsSelections = {
  milkingId: Milking['id'];
};

export type UpdateMilkingsSelections = {
  milkingId: Milking['id'];
};

export type CreateMilkingsOptions = Partial<Milking>;

export type UpdateMilkingsOptions = Partial<Milking>;

export const MilkingSelect = {
  createdAt: true,
  id: true,
  note: true,
  date: true,
  method: true,
  quantity: true,
  animalId: true,
  userCreatedId: true,
  organizationId: true,
};
