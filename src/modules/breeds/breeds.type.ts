import { Breed } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetBreedsSelections = {
  search?: string;
  type?: Breed['type'];
  organizationId?: string;
  pagination?: PaginationType;
};

export type GetOneBreedsSelections = {
  breedId?: Breed['id'];
  type?: Breed['type'];
  organizationId?: Breed['organizationId'];
};

export type UpdateBreedsSelections = {
  breedId: Breed['id'];
};

export type CreateBreedsOptions = Partial<Breed>;

export type UpdateBreedsOptions = Partial<Breed>;

export const BreedsSelect = {
  createdAt: true,
  id: true,
  name: true,
  _count: {
    select: {
      animals: true,
    },
  },
};
