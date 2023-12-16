import { Contributor } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetContributorsSelections = {
  search?: string;
  pagination?: PaginationType;
};

export type GetOneContributorsSelections = {
  contributorId?: Contributor['id'];
  userId?: Contributor['userId'];
  organizationId?: Contributor['organizationId'];
};

export type UpdateContributorsSelections = {
  contributorId?: Contributor['id'];
};

export type CreateContributorsOptions = Partial<Contributor>;

export type UpdateContributorsOptions = Partial<Contributor>;
