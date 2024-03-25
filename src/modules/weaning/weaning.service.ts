import { Injectable } from '@nestjs/common';
import { Prisma, Weaning } from '@prisma/client';
import { DatabaseService } from '../../app/database/database.service';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import {
  CreateWeaningsOptions,
  GetOneWeaningSelections,
  GetWeaningsSelections,
  UpdateWeaningsOptions,
  UpdateWeaningsSelections,
  WeaningSelect,
} from './weaning.type';

@Injectable()
export class WeaningsService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(
    selections: GetWeaningsSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhere = {} as Prisma.WeaningWhereInput;
    const { search, organizationId, pagination } = selections;

    if (search) {
      Object.assign(prismaWhere, {
        OR: [
          {
            code: { contains: search, mode: 'insensitive' },
          },
        ],
      });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    const weanings = await this.client.weaning.findMany({
      where: { ...prismaWhere, deletedAt: null },
      take: pagination.take,
      skip: pagination.skip,
      select: WeaningSelect,
      orderBy: pagination.orderBy,
    });

    const rowCount = await this.client.weaning.count({
      where: { ...prismaWhere, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      value: weanings,
    });
  }
  /** Find one weaning in database. */
  async findOneBy(selections: GetOneWeaningSelections) {
    const prismaWhere = {} as Prisma.WeaningWhereInput;
    const { weaningId, organizationId } = selections;

    if (weaningId) {
      Object.assign(prismaWhere, { id: weaningId });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    const weaning = await this.client.weaning.findFirst({
      where: { ...prismaWhere, deletedAt: null },
      select: WeaningSelect,
    });

    // const weaning = await this.client.weaning.findUnique({
    //   select: WeaningSelect,
    //   where: {
    //     id: weaningId,
    //   },
    // });

    return weaning;
  }

  /** Create one weaning in database. */
  async createOne(options: CreateWeaningsOptions): Promise<Weaning> {
    const {
      note,
      date,
      litter,
      animalId,
      farrowingId,
      organizationId,
      userCreatedId,
    } = options;

    const weaning = this.client.weaning.create({
      data: {
        note,
        date,
        litter,
        animalId,
        farrowingId,
        organizationId,
        userCreatedId,
      },
    });

    return weaning;
  }

  /** Update one weaning in database. */
  async updateOne(
    selections: UpdateWeaningsSelections,
    options: UpdateWeaningsOptions,
  ): Promise<Weaning> {
    const { weaningId } = selections;
    const { note, litter, date, organizationId, userCreatedId, animalId } =
      options;

    const weaning = this.client.weaning.update({
      where: {
        id: weaningId,
      },
      data: {
        note,
        date,
        litter,
        animalId,
        organizationId,
        userCreatedId,
      },
    });

    return weaning;
  }
}
