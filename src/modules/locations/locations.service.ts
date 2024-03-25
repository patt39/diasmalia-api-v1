import { Injectable } from '@nestjs/common';
import { Location, Prisma } from '@prisma/client';
import { DatabaseService } from '../../app/database/database.service';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import {
  CreateLocationsOptions,
  GetLocationsSelections,
  GetOneLocationsSelections,
  LocationsSelect,
  UpdateLocationsOptions,
  UpdateLocationsSelections,
} from './locations.type';

@Injectable()
export class LocationsService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(
    selections: GetLocationsSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhere = {} as Prisma.LocationWhereInput;
    const { search, type, pagination } = selections;

    if (search) {
      Object.assign(prismaWhere, {
        OR: [{ number: { contains: search, mode: 'insensitive' } }],
      });
    }

    if (type) {
      Object.assign(prismaWhere, { type });
    }

    const locations = await this.client.location.findMany({
      where: { ...prismaWhere, deletedAt: null },
      take: pagination.take,
      skip: pagination.skip,
      select: LocationsSelect,
      orderBy: pagination.orderBy,
    });

    const rowCount = await this.client.location.count({
      where: { ...prismaWhere, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      value: locations,
    });
  }

  /** Find one location in database. */
  async findOneBy(selections: GetOneLocationsSelections) {
    const prismaWhere = {} as Prisma.LocationWhereInput;

    const { locationId, type, number, organizationId } = selections;

    if (locationId) {
      Object.assign(prismaWhere, { id: locationId });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    if (type) {
      Object.assign(prismaWhere, { type });
    }

    if (number) {
      Object.assign(prismaWhere, { number });
    }

    const location = await this.client.location.findFirst({
      where: { ...prismaWhere, deletedAt: null },
      select: LocationsSelect,
    });

    return location;
  }

  /** Create one location in database. */
  async createOne(options: CreateLocationsOptions): Promise<Location> {
    const {
      type,
      number,
      manger,
      through,
      squareMeter,
      organizationId,
      userCreatedId,
    } = options;

    const location = this.client.location.create({
      data: {
        type,
        number,
        manger,
        through,
        squareMeter,
        organizationId,
        userCreatedId,
      },
    });

    return location;
  }

  /** Update one location in database. */
  async updateOne(
    selections: UpdateLocationsSelections,
    options: UpdateLocationsOptions,
  ): Promise<Location> {
    const { locationId } = selections;
    const {
      type,
      number,
      manger,
      through,
      squareMeter,
      organizationId,
      deletedAt,
    } = options;

    const location = this.client.location.update({
      where: {
        id: locationId,
      },
      data: {
        type,
        number,
        manger,
        through,
        squareMeter,
        organizationId,
        deletedAt,
      },
    });

    return location;
  }
}
