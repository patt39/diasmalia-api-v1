import { Contributor } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetContributorsSelections = {
  search?: string;
  organizationId: string;
  pagination?: PaginationType;
};

export type GetOneContributorsSelections = {
  contributorId?: Contributor['id'];
  userId?: Contributor['userId'];
  organizationId?: Contributor['organizationId'];
  role?: Contributor['role'];
};

export type UpdateContributorsSelections = {
  contributorId?: Contributor['id'];
};

export type CreateContributorsOptions = Partial<Contributor>;

export type UpdateContributorsOptions = Partial<Contributor>;

export const ContributorSelect = {
  createdAt: true,
  id: true,
  role: true,
  userId: true,
  organizationId: true,
  organization: {
    select: {
      name: true,
      description: true,
    },
  },
  userCreatedId: true,
};
