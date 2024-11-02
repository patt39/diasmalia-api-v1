import { Injectable } from '@nestjs/common';
import { Organization, Prisma } from '@prisma/client';
import { DatabaseService } from '../../app/database/database.service';
import {
  CreateOrganizationsOptions,
  GetOneOrganizationsSelections,
  GetOrganizationsSelections,
  OrganizationSelect,
  UpdateOrganizationsOptions,
  UpdateOrganizationsSelections,
} from './organizations.type';

import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';

@Injectable()
export class OrganizationsService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(
    selections: GetOrganizationsSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhere = {} as Prisma.OrganizationWhereInput;
    const { search, pagination } = selections;

    if (search) {
      Object.assign(prismaWhere, {
        OR: [{ name: { code: { contains: search, mode: 'insensitive' } } }],
      });
    }

    const organizations = await this.client.organization.findMany({
      take: pagination.take,
      skip: pagination.skip,
      select: OrganizationSelect,
      orderBy: pagination.orderBy,
    });

    const rowCount = await this.client.organization.count({
      where: { ...prismaWhere, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      value: organizations,
    });
  }

  /** Find one Organization in database. */
  async findOneBy(selections: GetOneOrganizationsSelections) {
    const prismaWhereOrganization = {} as Prisma.OrganizationWhereInput;
    const { organizationId, userId } = selections;

    if (organizationId) {
      Object.assign(prismaWhereOrganization, { id: organizationId });
    }

    if (userId) {
      Object.assign(prismaWhereOrganization, { userId });
    }

    const organization = await this.client.organization.findFirst({
      where: { ...prismaWhereOrganization, deletedAt: null },
      select: OrganizationSelect,
    });

    return organization;
  }

  /** Create one Organization in database. */
  async createOne(options: CreateOrganizationsOptions): Promise<Organization> {
    const { name, logo, image, description, userId } = options;

    const organization = this.client.organization.create({
      data: {
        name,
        logo,
        image,
        userId,
        description,
      },
    });

    return organization;
  }

  /** Update one Organization in database. */
  async updateOne(
    selections: UpdateOrganizationsSelections,
    options: UpdateOrganizationsOptions,
  ): Promise<Organization> {
    const { organizationId } = selections;
    const { name, logo, image, description, deletedAt } = options;

    const organization = this.client.organization.update({
      where: { id: organizationId },
      data: {
        name,
        logo,
        image,
        description,
        deletedAt,
      },
    });

    return organization;
  }
}
