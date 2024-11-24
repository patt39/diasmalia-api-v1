import { Material } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetMaterialsSelections = {
  type?: Material['type'];
  pagination?: PaginationType;
};

export type GetOneMaterialSelections = {
  materialId?: Material['id'];
};

export type UpdateMaterialsSelections = {
  materialId: Material['id'];
};

export type CreateMaterialsOptions = Partial<Material>;

export type UpdateMaterialsOptions = Partial<Material>;

export const MaterialSelect = {
  createdAt: true,
  id: true,
  name: true,
  image: true,
  type: true,
};
