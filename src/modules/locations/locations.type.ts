import { Location } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetLocationsSelections = {
  search?: string;
  locationId?: Location['id'];
  pagination?: PaginationType;
  type?: Location['type'];
  organizationId?: Location['organizationId'];
};

export type GetOneLocationsSelections = {
  locationId?: Location['id'];
  number?: Location['number'];
  type?: Location['type'];
  organizationId?: Location['organizationId'];
};

export type UpdateLocationsSelections = {
  locationId: Location['id'];
};

export type CreateLocationsOptions = Partial<Location>;

export type UpdateLocationsOptions = Partial<Location>;

export const LocationsSelect = {
  createdAt: true,
  id: true,
  number: true,
  squareMeter: true,
  through: true,
  manger: true,
  type: true,
  userCreatedId: true,
  organizationId: true,
  organization: {
    select: {
      name: true,
    },
  },
};
