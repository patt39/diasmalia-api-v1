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
    const {
      search,
      status,
      addCages,
      buildingId,
      animalTypeId,
      productionPhase,
      pagination,
      organizationId,
    } = selections;

    if (search) {
      Object.assign(prismaWhere, {
        OR: [{ code: { contains: search, mode: 'insensitive' } }],
      });
    }

    if (status) {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      status === 'true'
        ? Object.assign(prismaWhere, { status: true })
        : Object.assign(prismaWhere, { status: false });
    }

    if (addCages) {
      Object.assign(prismaWhere, { addCages });
    }

    if (buildingId) {
      Object.assign(prismaWhere, { buildingId });
    }

    if (animalTypeId) {
      Object.assign(prismaWhere, { animalTypeId });
    }

    if (productionPhase) {
      Object.assign(prismaWhere, { productionPhase });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    const locations = await this.client.location.findMany({
      where: { ...prismaWhere, deletedAt: null },
      take: pagination.take,
      skip: pagination.skip,
      select: LocationsSelect,
      orderBy: pagination.orderBy,
    });

    const initialValue = 0;
    const sumAnimals = locations.reduce(
      (accumulator: any, currentValue: any) =>
        accumulator + currentValue._count?.animals,
      initialValue,
    );

    const rowCount = await this.client.location.count({
      where: { ...prismaWhere, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      animals: sumAnimals,
      value: locations,
    });
  }

  /** Find one location in database. */
  async findOneByCode(selections: GetOneLocationsSelections) {
    const { code } = selections;

    const location = await this.client.location.findFirst({
      select: LocationsSelect,
      where: {
        code: code,
      },
    });

    return location;
  }

  /** Find one location in database. */
  async findOneBy(selections: GetOneLocationsSelections) {
    const prismaWhere = {} as Prisma.LocationWhereInput;

    const {
      code,
      status,
      addCages,
      locationId,
      animalTypeId,
      productionPhase,
      organizationId,
    } = selections;

    if (locationId) {
      Object.assign(prismaWhere, { id: locationId });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    if (status) {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      status === 'true'
        ? Object.assign(prismaWhere, { status: true })
        : Object.assign(prismaWhere, { status: false });
    }

    if (addCages) {
      Object.assign(prismaWhere, { addCages });
    }

    if (animalTypeId) {
      Object.assign(prismaWhere, { animalTypeId });
    }

    if (code) {
      Object.assign(prismaWhere, { code });
    }

    if (productionPhase) {
      Object.assign(prismaWhere, { productionPhase });
    }

    const location = await this.client.location.findFirst({
      where: { ...prismaWhere, deletedAt: null },
      select: LocationsSelect,
    });

    const sumMales = await this.client.animal.count({
      where: {
        gender: 'MALE',
        status: 'ACTIVE',
        deletedAt: null,
        locationId: location?.id,
        animalTypeId: animalTypeId,
      },
    });

    const sumFemales = await this.client.animal.count({
      where: {
        deletedAt: null,
        gender: 'FEMALE',
        status: 'ACTIVE',
        locationId: location?.id,
        animalTypeId: animalTypeId,
      },
    });

    return { ...location, sumMales, sumFemales };
  }

  /** Create one location in database. */
  async createOne(options: CreateLocationsOptions): Promise<Location> {
    const {
      code,
      nest,
      cages,
      manger,
      through,
      addCages,
      buildingId,
      squareMeter,
      animalTypeId,
      productionPhase,
      organizationId,
      userCreatedId,
    } = options;

    const location = this.client.location.create({
      data: {
        code,
        nest,
        cages,
        manger,
        through,
        addCages,
        buildingId,
        squareMeter,
        animalTypeId,
        productionPhase,
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
      code,
      nest,
      cages,
      manger,
      status,
      through,
      addCages,
      buildingId,
      squareMeter,
      productionPhase,
      deletedAt,
    } = options;

    const location = this.client.location.update({
      where: { id: locationId },
      data: {
        code,
        nest,
        cages,
        manger,
        status,
        through,
        addCages,
        buildingId,
        squareMeter,
        productionPhase,
        deletedAt,
      },
    });

    return location;
  }
}
