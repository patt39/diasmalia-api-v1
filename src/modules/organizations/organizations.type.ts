import { Organization } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetOrganizationsSelections = {
  search?: string;
  userId?: string;
  pagination?: PaginationType;
};

export type GetOneOrganizationsSelections = {
  organizationId?: Organization['id'];
  userId?: Organization['userId'];
};

export type UpdateOrganizationsSelections = {
  organizationId?: Organization['id'];
  userId?: Organization['userId'];
};

export type CreateOrganizationsOptions = Partial<Organization>;

export type UpdateOrganizationsOptions = Partial<Organization>;

export const OrganizationSelect = {
  createdAt: true,
  id: true,
  name: true,
  description: true,
  userId: true,
  _count: {
    select: {
      images: true,
    },
  },
  user: {
    select: {
      email: true,
    },
  },
};
