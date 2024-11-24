import { AssignMaterial } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetAssignMaterialsSelections = {
  type?: string;
  search?: string;
  materialId?: AssignMaterial['materialId'];
  locationId?: AssignMaterial['locationId'];
  buildingId?: AssignMaterial['buildingId'];
  organizationId: string;
  pagination?: PaginationType;
};

export type GetOneAssignMaterialSelections = {
  assignMaterialId?: AssignMaterial['id'];
  locationId?: AssignMaterial['locationId'];
  materialId?: AssignMaterial['materialId'];
  buildingId?: AssignMaterial['buildingId'];
  organizationId?: AssignMaterial['organizationId'];
};

export type UpdateAssignMaterialSelections = {
  assignMaterialId: AssignMaterial['id'];
};

export type CreateAssignMaterialsOptions = Partial<AssignMaterial>;

export type UpdateAssignMaterialOptions = Partial<AssignMaterial>;

export const AllAssignedMaterialsSelect = {
  createdAt: true,
  id: true,
  status: true,
  materialId: true,
  material: {
    select: {
      id: true,
      name: true,
      type: true,
      image: true,
    },
  },
  buildingId: true,
  building: {
    select: {
      id: true,
      code: true,
    },
  },
  locationId: true,
  location: {
    select: {
      code: true,
      productionPhase: true,
    },
  },
  organizationId: true,
  organization: {
    select: {
      name: true,
      logo: true,
      description: true,
    },
  },
};
