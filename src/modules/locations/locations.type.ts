import { AnimalStatus, Location } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetLocationsSelections = {
  search?: string;
  status?: string;
  pagination?: PaginationType;
  type?: Location['type'];
  locationId?: Location['id'];
  animalTypeId?: Location['animalTypeId'];
  productionPhase?: Location['productionPhase'];
  organizationId?: Location['organizationId'];
};

export type GetOneLocationsSelections = {
  status?: string;
  locationId?: Location['id'];
  code?: Location['code'];
  type?: Location['type'];
  animalTypeId?: Location['animalTypeId'];
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
  nest: true,
  type: true,
  status: true,
  squareMeter: true,
  through: true,
  manger: true,
  animalTypeId: true,
  animalType: {
    select: {
      name: true,
    },
  },
  productionPhase: true,
  organizationId: true,
  organization: {
    select: {
      name: true,
    },
  },
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
  animals: {
    where: {
      deletedAt: null,
      status: 'ACTIVE' as AnimalStatus,
    },
  },
};
