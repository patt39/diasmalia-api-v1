import { Organization } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetOrganizationsSelections = {
  search?: string;
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
