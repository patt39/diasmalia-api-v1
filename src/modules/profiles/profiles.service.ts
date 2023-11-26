import { Injectable } from '@nestjs/common';
import {
  CreateProfilesOptions,
  GetProfilesSelections,
  GetOneProfilesSelections,
  UpdateProfilesOptions,
  UpdateProfilesSelections,
} from './profiles.type';
import { DatabaseService } from '../../app/database/database.service';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import { Profile, Prisma } from '@prisma/client';

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
            fullName: { contains: search, mode: 'insensitive' },
            description: { contains: search, mode: 'insensitive' },
            email: { contains: search, mode: 'insensitive' },
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

    const Profiles = await this.client.profile.findMany(arg);
    const rowCount = await this.client.profile.count({
      where: { ...prismaWhereProfile, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      value: Profiles,
    });
  }

  /** Find one Profiles to the database. */
  async findOneBy(selections: GetOneProfilesSelections) {
    const { profileId } = selections;
    const contact = await this.client.profile.findUnique({
      where: {
        id: profileId,
      },
    });

    return contact;
  }

  /** Create one Profiles to the database. */
  async createOne(options: CreateProfilesOptions): Promise<Profile> {
    const {
      firstName,
      lastName,
      address,
      phone,
      image,
      color,
      url,
      description,
      birthday,
      userId,
    } = options;

    const profile = await this.client.profile.create({
      data: {
        firstName,
        lastName,
        address,
        phone,
        image,
        color,
        url,
        description,
        birthday,
        userId,
      },
    });

    return profile;
  }

  /** Update one Profiles to the database. */
  async updateOne(
    selections: UpdateProfilesSelections,
    options: UpdateProfilesOptions,
  ): Promise<Profile> {
    const { profileId } = selections;
    const {
      firstName,
      lastName,
      address,
      phone,
      image,
      color,
      url,
      description,
      birthday,
      deletedAt,
    } = options;

    const profile = await this.client.profile.update({
      where: {
        id: profileId,
      },
      data: {
        firstName,
        lastName,
        address,
        phone,
        image,
        color,
        url,
        description,
        birthday,
        deletedAt,
      },
    });

    return profile;
  }
}
