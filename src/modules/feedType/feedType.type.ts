import { FeedType } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetFeedTypesSelections = {
  search?: string;
  organizationId: string;
  pagination?: PaginationType;
};

export type GetOneFeedTypeSelections = {
  feedTypeId?: FeedType['id'];
  organizationId?: FeedType['organizationId'];
};

export type UpdateFeedTypesSelections = {
  feedTypeId: FeedType['id'];
};

export type CreateFeedTypesOptions = Partial<FeedType>;

export type UpdateFeedTypesOptions = Partial<FeedType>;

export const FeedTypeSelect = {
  createdAt: true,
  id: true,
  name: true,
  organizationId: true,
  organization: {
    select: {
      name: true,
    },
  },
  _count: {
    select: {
      feedings: true,
    },
  },
};
