import { AnimalStatus, Location } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetLocationsSelections = {
  search?: string;
  locationId?: Location['id'];
  pagination?: PaginationType;
  type?: Location['type'];
  productionPhase?: Location['productionPhase'];
  organizationId?: Location['organizationId'];
};

export type GetOneLocationsSelections = {
  locationId?: Location['id'];
  code?: Location['code'];
  type?: Location['type'];
  productionPhase?: Location['productionPhase'];
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
  code: true,
  squareMeter: true,
  through: true,
  manger: true,
  type: true,
  userCreatedId: true,
  productionPhase: true,
  organizationId: true,
  organization: {
    select: {
      name: true,
    },
  },
  //animals: true,
  _count: {
    select: {
      animals: {
        where: {
          deletedAt: null,
          status: 'ACTIVE' as AnimalStatus,
        },
      },
    },
  },
};
