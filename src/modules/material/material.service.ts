import { Injectable } from '@nestjs/common';
import { Material, Prisma } from '@prisma/client';
import { DatabaseService } from '../../app/database/database.service';
import {
  withPagination,
  WithPaginationResponse,
} from '../../app/utils/pagination';
import {
  CreateMaterialsOptions,
  GetMaterialsSelections,
  GetOneMaterialSelections,
  MaterialSelect,
  UpdateMaterialsOptions,
  UpdateMaterialsSelections,
} from './material.type';

@Injectable()
export class MaterialService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(
    selections: GetMaterialsSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhere = {} as Prisma.MaterialWhereInput;
    const { pagination, type } = selections;

    if (type) {
      Object.assign(prismaWhere, { type });
    }

    const blogs = await this.client.material.findMany({
      where: { ...prismaWhere, deletedAt: null },
      take: pagination.take,
      skip: pagination.skip,
      select: MaterialSelect,
      orderBy: pagination.orderBy,
    });

    const rowCount = await this.client.material.count({
      where: { ...prismaWhere, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      value: blogs,
    });
  }

  /** Find one material in database. */
  async findOneBy(selections: GetOneMaterialSelections) {
    const prismaWhere = {} as Prisma.MaterialWhereInput;

    const { materialId } = selections;

    if (materialId) {
      Object.assign(prismaWhere, { id: materialId });
    }

    const material = await this.client.material.findFirst({
      where: { ...prismaWhere, deletedAt: null },
    });

    return material;
  }

  /** Create one material in database. */
  async createOne(options: CreateMaterialsOptions): Promise<Material> {
    const { name, type, image } = options;

    const material = this.client.material.create({
      data: {
        name,
        type,
        image,
      },
    });

    return material;
  }

  /** Update one material in database. */
  async updateOne(
    selections: UpdateMaterialsSelections,
    options: UpdateMaterialsOptions,
  ): Promise<Material> {
    const { materialId } = selections;
    const { image, deletedAt } = options;

    const material = this.client.material.update({
      where: { id: materialId },
      data: {
        image,
        deletedAt,
      },
    });

    return material;
  }
}
