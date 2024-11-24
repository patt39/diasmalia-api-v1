import { AnimalStatus, Location } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetLocationsSelections = {
  search?: string;
  status?: string;
  pagination?: PaginationType;
  locationId?: Location['id'];
  addCages?: Location['addCages'];
  buildingId?: Location['buildingId'];
  animalTypeId?: Location['animalTypeId'];
  productionPhase?: Location['productionPhase'];
  organizationId?: Location['organizationId'];
};

export type GetOneLocationsSelections = {
  status?: string;
  code?: Location['code'];
  locationId?: Location['id'];
  addCages?: Location['addCages'];
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
  deletedAt: true,
  id: true,
  code: true,
  nest: true,
  cages: true,
  status: true,
  addCages: true,
  squareMeter: true,
  through: true,
  manger: true,
  animalTypeId: true,
  animalType: {
    select: {
      name: true,
    },
  },
  buildingId: true,
  building: {
    select: {
      code: true,
      productionPhase: true,
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
      assignMaterials: {
        where: {
          status: true,
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
