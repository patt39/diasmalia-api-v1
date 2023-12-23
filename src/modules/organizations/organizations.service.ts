import { Injectable } from '@nestjs/common';
import {
  CreateOrganizationsOptions,
  GetOneOrganizationsSelections,
  UpdateOrganizationsOptions,
  UpdateOrganizationsSelections,
} from './organizations.type';
import { DatabaseService } from '../../app/database/database.service';
import { Organization, Prisma } from '@prisma/client';

@Injectable()
export class OrganizationsService {
  constructor(private readonly client: DatabaseService) {}

  /** Find one Organizations to the database. */
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
    });

    return organization;
  }

  /** Create one Organizations to the database. */
  async createOne(options: CreateOrganizationsOptions): Promise<Organization> {
    const { name, userId } = options;

    const organization = this.client.organization.create({
      data: {
        name,
        userId,
      },
    });

    return organization;
  }

  /** Update one Organizations to the database. */
  async updateOne(
    selections: UpdateOrganizationsSelections,
    options: UpdateOrganizationsOptions,
  ): Promise<Organization> {
    const { organizationId } = selections;
    const { name, deletedAt } = options;

    const organization = this.client.organization.update({
      where: {
        id: organizationId,
      },
      data: {
        name,
        deletedAt,
      },
    });

    return organization;
  }
}
