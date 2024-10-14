import { FeedStock } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetFeedStockSelections = {
  search?: string;
  organizationId?: string;
  animalTypeId?: string;
  periode?: number;
  animalTypeName?: string;
  pagination?: PaginationType;
};

export type GetOneFeedStockSelections = {
  feedStockId?: FeedStock['id'];
  animalTypeId?: FeedStock['animalTypeId'];
  feedCategory?: FeedStock['feedCategory'];
  organizationId?: FeedStock['organizationId'];
};

export type UpdateFeedStockSelections = {
  feedStockId: FeedStock['id'];
};

export type CreateFeedStocksOptions = Partial<FeedStock>;

export type UpdateFeedStocksOptions = Partial<FeedStock>;

export const FeedStockSelect = {
  createdAt: true,
  updatedAt: true,
  id: true,
  number: true,
  weight: true,
  bagWeight: true,
  composition: true,
  feedCategory: true,
  animalTypeName: true,
  animalTypeId: true,
  animalType: {
    select: {
      name: true,
    },
  },
};
