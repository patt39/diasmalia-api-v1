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
  confirmation: true,
  confirmedAt: true,
  user: {
    select: {
      id: true,
      email: true,
      organizationId: true,
      profile: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          occupation: true,
          address: true,
          phone: true,
          photo: true,
          city: true,
          description: true,
          currency: {
            select: {
              symbol: true,
            },
          },
        },
      },
    },
  },
  organizationId: true,
  organization: {
    select: {
      name: true,
      description: true,
      _count: {
        select: {
          suggestions: {
            where: {
              deletedAt: null,
            },
          },
        },
      },
    },
  },
  userCreatedId: true,
};
