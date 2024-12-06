import { Injectable } from '@nestjs/common';
import { Image, Prisma } from '@prisma/client';
import { DatabaseService } from '../../app/database/database.service';
import {
  withPagination,
  WithPaginationResponse,
} from '../../app/utils/pagination';
import {
  CreateImagesOptions,
  GetImagesSelections,
  GetOneImageSelections,
  imagesSelect,
  UpdateImagesOptions,
  UpdateImagesSelections,
} from './images.type';

@Injectable()
export class ImagesService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(
    selections: GetImagesSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhere = {} as Prisma.ImageWhereInput;
    const { pagination, userCreatedId, organizationId } = selections;

    if (userCreatedId) {
      Object.assign(prismaWhere, { userCreatedId });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    const images = await this.client.image.findMany({
      where: { ...prismaWhere, deletedAt: null },
      take: pagination.take,
      skip: pagination.skip,
      select: imagesSelect,
      orderBy: pagination.orderBy,
    });
    const rowCount = await this.client.image.count({
      where: { ...prismaWhere, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      value: images,
    });
  }

  /** Find one image in database. */
  async findOneBy(selections: GetOneImageSelections) {
    const prismaWhere = {} as Prisma.ImageWhereInput;
    const { imageId } = selections;

    if (imageId) {
      Object.assign(prismaWhere, { id: imageId });
    }

    const image = await this.client.image.findFirst({
      where: { ...prismaWhere, deletedAt: null },
      select: imagesSelect,
    });

    return image;
  }

  /** Create one image in database. */
  async createOne(options: CreateImagesOptions): Promise<Image> {
    const { organizationId, link, userCreatedId } = options;

    const image = this.client.image.create({
      data: { organizationId, link, userCreatedId },
    });

    return image;
  }

  /** Update one image in database. */
  async updateOne(
    selections: UpdateImagesSelections,
    options: UpdateImagesOptions,
  ): Promise<Image> {
    const { imageId } = selections;
    const { link, deletedAt } = options;

    const image = this.client.image.update({
      where: { id: imageId },
      data: { link, deletedAt },
    });

    return image;
  }
}
