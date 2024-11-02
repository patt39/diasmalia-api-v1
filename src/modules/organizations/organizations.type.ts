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
  logo: true,
  name: true,
  image: true,
  description: true,
  userId: true,
  user: {
    select: {
      email: true,
    },
  },
};
