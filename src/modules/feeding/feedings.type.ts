import { Feeding } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetFeedingsSelections = {
  search?: string;
  organizationId?: string;
  animalTypeId?: string;
  periode?: number;
  pagination?: PaginationType;
};

export type GetOneFeedingSelections = {
  feedingId?: Feeding['id'];
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
  feedType: true,
  animal: {
    select: {
      code: true,
      productionPhase: true,
    },
  },
  animalTypeId: true,
  animalType: {
    select: {
      name: true,
    },
  },
};
