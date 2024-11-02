import { Injectable } from '@nestjs/common';
import { Contributor, Prisma } from '@prisma/client';
import { DatabaseService } from '../../app/database/database.service';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import {
  ContributorSelect,
  CreateContributorsOptions,
  GetContributorsSelections,
  GetOneContributorsSelections,
  UpdateContributorsOptions,
  UpdateContributorsSelections,
} from './contributors.type';

@Injectable()
export class ContributorsService {
  constructor(private readonly client: DatabaseService) {}
  async findAll(
    selections: GetContributorsSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhereContributor = {} as Prisma.ContributorWhereInput;
    const { pagination, search, role, userId, organizationId } = selections;

    if (search) {
      Object.assign(prismaWhereContributor, {
        OR: [
          { user: { email: { contains: search, mode: 'insensitive' } } },
          { organization: { name: { contains: search, mode: 'insensitive' } } },
          {
            user: {
              profile: { firstName: { contains: search, mode: 'insensitive' } },
            },
          },
          {
            user: {
              profile: { lastName: { contains: search, mode: 'insensitive' } },
            },
          },
        ],
      });
    }

    if (role) {
      Object.assign(prismaWhereContributor, { role });
    }

    if (userId) {
      Object.assign(prismaWhereContributor, { userId });
    }

    if (organizationId) {
      Object.assign(prismaWhereContributor, { organizationId });
    }

    const contributors = await this.client.contributor.findMany({
      where: { ...prismaWhereContributor, deletedAt: null },
      skip: pagination.skip,
      select: ContributorSelect,
      take: pagination.take,
      orderBy: pagination.orderBy,
    });
    const rowCount = await this.client.contributor.count({
      where: { ...prismaWhereContributor, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      value: contributors,
    });
  }

  /** Find one Contributor in database. */
  async findOneBy(selections: GetOneContributorsSelections) {
    const prismaWhereContributor = {} as Prisma.ContributorWhereInput;
    const { contributorId, userId, organizationId, role } = selections;

    if (userId) {
      Object.assign(prismaWhereContributor, { userId });
    }

    if (organizationId) {
      Object.assign(prismaWhereContributor, { organizationId });
    }

    if (contributorId) {
      Object.assign(prismaWhereContributor, { id: contributorId });
    }

    if (role) {
      Object.assign(prismaWhereContributor, { role });
    }

    const contributor = await this.client.contributor.findFirst({
      where: { ...prismaWhereContributor, deletedAt: null },
      select: ContributorSelect,
    });

    return contributor;
  }

  /** Create one Contributor in database. */
  async createOne(options: CreateContributorsOptions): Promise<Contributor> {
    const {
      role,
      userId,
      confirmation,
      confirmedAt,
      organizationId,
      userCreatedId,
    } = options;

    const contributor = this.client.contributor.create({
      data: {
        role,
        userId,
        confirmation,
        confirmedAt,
        organizationId,
        userCreatedId,
      },
    });

    return contributor;
  }

  /** Update one Contributor in database. */
  async updateOne(
    selections: UpdateContributorsSelections,
    options: UpdateContributorsOptions,
  ): Promise<Contributor> {
    const { contributorId } = selections;
    const { role, confirmedAt, confirmation, deletedAt, updatedAt } = options;

    const contributor = this.client.contributor.update({
      where: { id: contributorId },
      data: { role, confirmedAt, confirmation, deletedAt, updatedAt },
    });

    return contributor;
  }
}
