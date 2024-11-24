import { Building } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetBuildingsSelections = {
  search?: string;
  pagination?: PaginationType;
  buildingId?: Building['id'];
  animalTypeId?: Building['animalTypeId'];
  productionPhase?: Building['productionPhase'];
  organizationId?: Building['organizationId'];
};

export type GetOneBuildingsSelections = {
  code?: Building['code'];
  buildingId?: Building['id'];
  animalTypeId?: Building['animalTypeId'];
  productionPhase?: Building['productionPhase'];
  organizationId?: Building['organizationId'];
};

export type UpdateBuildingsSelections = {
  buildingId: Building['id'];
};

export type CreateBuildingsOptions = Partial<Building>;

export type UpdateBuildingsOptions = Partial<Building>;

export const BuildingsSelect = {
  createdAt: true,
  id: true,
  code: true,
  squareMeter: true,
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
  locations: {
    where: {
      deletedAt: null,
    },
  },
  _count: {
    select: {
      locations: {
        where: {
          deletedAt: null,
        },
      },
      assignMaterials: {
        where: {
          status: true,
        },
      },
    },
  },
};
