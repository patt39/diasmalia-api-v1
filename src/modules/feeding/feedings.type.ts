import { FeedType, Feeding } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetFeedingsSelections = {
  search?: string;
  organizationId?: string;
  feedType?: FeedType;
  pagination?: PaginationType;
};

export type GetOneFeedingSelections = {
  feedingId?: Feeding['id'];
  organizationId?: Feeding['organizationId'];
};

export type UpdateFeedingsSelections = {
  feedingId: Feeding['id'];
};

export type CreateFeedingsOptions = Partial<Feeding>;

export type UpdateFeedingsOptions = Partial<Feeding>;

export const FeedingSelect = {
  createdAt: true,
  id: true,
  quantity: true,
  date: true,
  feedType: true,
  productionPhase: true,
  animalId: true,
  animal: {
    select: {
      code: true,
      weight: true,
      productionPhase: true,
      gender: true,
      type: true,
      locationId: true,
      location: {
        select: {
          number: true,
        },
      },
    },
  },
  organizationId: true,
  userCreatedId: true,
  note: true,
};
