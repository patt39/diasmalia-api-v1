import { Feeding } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetFeedingsSelections = {
  search?: string;
  organizationId: string;
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
  type: true,
  productionPhase: true,
  organizationId: true,
  userCreatedId: true,
  animalId: true,
  note: true,
};
