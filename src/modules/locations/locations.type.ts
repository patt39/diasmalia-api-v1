import { AnimalStatus, Location } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetLocationsSelections = {
  search?: string;
  locationId?: Location['id'];
  pagination?: PaginationType;
  animalTypeId?: Location['animalTypeId'];
  productionPhase?: Location['productionPhase'];
  organizationId?: Location['organizationId'];
};

export type GetOneLocationsSelections = {
  locationId?: Location['id'];
  code?: Location['code'];
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
  status: true,
  squareMeter: true,
  through: true,
  manger: true,
  animalTypeId: true,
  animalType: {
    select: {
      icon: true,
      name: true,
    },
  },
  userCreatedId: true,
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
  // animals: true,
};
