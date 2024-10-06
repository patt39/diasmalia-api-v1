import { Milking } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetMilkingsSelections = {
  search?: string;
  periode?: number;
  days?: string;
  months?: string;
  year?: string;
  animalTypeId?: string;
  organizationId?: string;
  pagination?: PaginationType;
};

export type GetOneMilkingsSelections = {
  milkingId?: Milking['id'];
  animalTypeId?: Milking['animalTypeId'];
  organizationId?: Milking['organizationId'];
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
  quantity: true,
  animalId: true,
  animal: {
    select: {
      code: true,
    },
  },
  animalTypeId: true,
  animalType: {
    select: {
      name: true,
    },
  },
};
