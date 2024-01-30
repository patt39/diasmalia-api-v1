import { Location } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetLocationsSelections = {
  search?: string;
  pagination?: PaginationType;
};

export type GetOneLocationsSelections = {
  locationId: Location['id'];
  organizationId: Location['organizationId'];
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
  organizationId: true,
  organization: {
    select: {
      name: true,
    },
  },
};
