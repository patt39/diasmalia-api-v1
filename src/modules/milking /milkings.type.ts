import { MethodMilking, Milking } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetMilkingsSelections = {
  search?: string;
  method?: MethodMilking;
  organizationId?: string;
  pagination?: PaginationType;
};

export type GetOneMilkingsSelections = {
  milkingId?: Milking['id'];
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
  date: true,
  method: true,
  quantity: true,
  animalId: true,
  animal: {
    select: {
      productionPhase: true,
      weight: true,
      status: true,
      type: true,
      birthday: true,
      gender: true,
      code: true,
      locationId: true,
      location: {
        select: {
          number: true,
        },
      },
      breedId: true,
      breed: {
        select: {
          name: true,
        },
      },
      organizationId: true,
      organization: {
        select: {
          name: true,
        },
      },
    },
  },
  userCreatedId: true,
};
