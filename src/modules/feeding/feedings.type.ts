import { Feeding } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetFeedingsSelections = {
  search?: string;
  organizationId?: string;
  animalTypeId?: string;
  periode?: number;
  days?: string;
  months?: string;
  year?: string;
  feedingsCount?: number;
  pagination?: PaginationType;
};

export type GetOneFeedingSelections = {
  feedingId?: Feeding['id'];
  animalId?: Feeding['animalId'];
  animalTypeId?: Feeding['animalTypeId'];
  organizationId?: Feeding['organizationId'];
};

export type UpdateFeedingsSelections = {
  feedingId: Feeding['id'];
};

export type CreateFeedingsOptions = Partial<Feeding>;

export type UpdateFeedingsOptions = Partial<Feeding>;

export const FeedingSelect = {
  createdAt: true,
  updatedAt: true,
  id: true,
  quantity: true,
  feedStockId: true,
  feedStock: {
    select: { feedCategory: true },
  },
  animal: {
    select: {
      code: true,
      status: true,
      quantity: true,
      productionPhase: true,
      location: {
        select: {
          code: true,
        },
      },
    },
  },
  animalTypeId: true,
  animalType: {
    select: {
      name: true,
    },
  },
};
