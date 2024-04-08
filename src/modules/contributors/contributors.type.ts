import { Contributor, RoleContributorRole } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetContributorsSelections = {
  search?: string;
  role?: RoleContributorRole;
  organizationId?: string;
  userId?: Contributor['userId'];
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
  user: {
    select: {
      email: true,
      id: true,
      profile: {
        select: {
          firstName: true,
          lastName: true,
          occupation: true,
          companyName: true,
          address: true,
          phone: true,
          description: true,
        },
      },
    },
  },
  organizationId: true,
  organization: {
    select: {
      logo: true,
      name: true,
      description: true,
    },
  },
  userCreatedId: true,
};
