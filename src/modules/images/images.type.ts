import { Image } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetImagesSelections = {
  pagination?: PaginationType;
  userCreatedId?: Image['userCreatedId'];
  organizationId?: Image['organizationId'];
};

export type GetOneImageSelections = {
  imageId?: Image['id'];
  organizationId?: string;
};

export type UpdateImagesSelections = {
  imageId: Image['id'];
};

export type CreateImagesOptions = Partial<Image>;

export type UpdateImagesOptions = Partial<Image>;

export const imagesSelect = {
  createdAt: true,
  id: true,
  link: true,
  organizationId: true,
  userCreatedId: true,
};
