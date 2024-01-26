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
    const { search, pagination } = selections;

    if (search) {
      Object.assign(prismaWhere, {
        OR: [
          {
            number: { contains: search, mode: 'insensitive' },
          },
        ],
      });
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

  /** Find one Locations to the database. */
  async findOneBy(selections: GetOneLocationsSelections) {
    const { locationId } = selections;
    const location = await this.client.location.findUnique({
      select: LocationsSelect,
      where: {
        id: locationId,
      },
    });

    return location;
  }

  /** Create one Locations to the database. */
  async createOne(options: CreateLocationsOptions): Promise<Location> {
    const { squareMeter, manger, through, number } = options;

    const location = this.client.location.create({
      data: {
        squareMeter,
        manger,
        through,
        number,
      },
    });

    return location;
  }

  /** Update one Locationss to the database. */
  async updateOne(
    selections: UpdateLocationsSelections,
    options: UpdateLocationsOptions,
  ): Promise<Location> {
    const { locationId } = selections;
    const { squareMeter, manger, through, number, deletedAt } = options;

    const location = this.client.location.update({
      where: {
        id: locationId,
      },
      data: {
        squareMeter,
        manger,
        through,
        number,
        deletedAt,
      },
    });

    return location;
  }
}
