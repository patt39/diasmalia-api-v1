import { Injectable } from '@nestjs/common';
import { Prisma, Profile } from '@prisma/client';
import { DatabaseService } from '../../app/database/database.service';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import {
  CreateProfilesOptions,
  GetOneProfilesSelections,
  GetProfilesSelections,
  UpdateProfilesOptions,
  UpdateProfilesSelections,
} from './profiles.type';

@Injectable()
export class ProfilesService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(
    selections: GetProfilesSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhereProfile = {} as Prisma.ProfileWhereInput;
    const { search, pagination } = selections;

    if (search) {
      Object.assign(prismaWhereProfile, {
        OR: [
          {
            firstName: { contains: search, mode: 'insensitive' },
            lastName: { contains: search, mode: 'insensitive' },
          },
        ],
      });
    }

    const paginationValue = {
      take: pagination.take,
      orderBy: pagination.orderBy,
    };

    const arg: any = {
      ...paginationValue,
      where: { ...prismaWhereProfile, deletedAt: null },
      skip: pagination?.cursor ? 1 : pagination.skip,
      cursor: pagination.cursor ? { id: pagination.cursor } : undefined,
    };

    const profiles = await this.client.profile.findMany(arg);
    const rowCount = await this.client.profile.count({
      where: { ...prismaWhereProfile, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      value: profiles,
    });
  }

  /** Find one Profile in database. */
  async findOneBy(selections: GetOneProfilesSelections) {
    const prismaWhereProfile = {} as Prisma.ProfileWhereInput;
    const { profileId } = selections;

    if (profileId) {
      Object.assign(prismaWhereProfile, { id: profileId });
    }

    const profile = await this.client.profile.findFirst({
      where: { ...prismaWhereProfile, deletedAt: null },
    });

    return profile;
  }

  /** Create one Profile in database. */
  async createOne(options: CreateProfilesOptions): Promise<Profile> {
    const {
      phone,
      photo,
      userId,
      address,
      birthday,
      lastName,
      firstName,
      companyName,
      occupation,
      description,
    } = options;

    const profile = this.client.profile.create({
      data: {
        phone,
        photo,
        userId,
        address,
        birthday,
        lastName,
        firstName,
        companyName,
        occupation,
        description,
      },
    });

    return profile;
  }

  /** Update one Profile in database. */
  async updateOne(
    selections: UpdateProfilesSelections,
    options: UpdateProfilesOptions,
  ): Promise<Profile> {
    const { profileId } = selections;
    const {
      phone,
      photo,
      address,
      birthday,
      lastName,
      firstName,
      companyName,
      occupation,
      description,
      deletedAt,
    } = options;

    const profile = this.client.profile.update({
      where: {
        id: profileId,
      },
      data: {
        phone,
        photo,
        address,
        birthday,
        lastName,
        firstName,
        companyName,
        occupation,
        description,
        deletedAt,
      },
    });

    return profile;
  }
}
