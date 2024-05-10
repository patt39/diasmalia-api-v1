import { Injectable } from '@nestjs/common';
import { Organization, Prisma } from '@prisma/client';
import { DatabaseService } from '../../app/database/database.service';
import {
  CreateOrganizationsOptions,
  GetOneOrganizationsSelections,
  OrganizationSelect,
  UpdateOrganizationsOptions,
  UpdateOrganizationsSelections,
} from './organizations.type';

@Injectable()
export class OrganizationsService {
  constructor(private readonly client: DatabaseService) {}

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
