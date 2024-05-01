import { AssignType } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetAssignTypesSelections = {
  search?: string;
  animalTypeId?: AssignType['animalTypeId'];
  userId?: AssignType['userId'];
  organizationId: string;
  pagination?: PaginationType;
};

export type GetOneAssignTypeSelections = {
  search?: string;
  status?: boolean;
  pagination?: PaginationType;
  assignTypeId?: AssignType['id'];
  animalTypeId?: AssignType['animalTypeId'];
  organizationId?: AssignType['organizationId'];
};

export type UpdateAssignTypesSelections = {
  assignTypeId: AssignType['id'];
};

export type CreateAssignTypesOptions = Partial<AssignType>;

export type UpdateAssignTypesOptions = Partial<AssignType>;

export const AllAssignedTypeSelect = {
  createdAt: true,
  id: true,
  userId: true,
  user: {
    select: {
      email: true,
      profile: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  },
  animalTypeId: true,
  animalType: {
    select: {
      icon: true,
      name: true,
    },
  },
  organizationId: true,
};
