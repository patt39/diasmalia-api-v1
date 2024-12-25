import { User } from '@prisma/client';
import * as argon2 from 'argon2';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type JwtPayloadType = {
  id: string;
  organizationId: string;
};

export type GetUsersSelections = {
  search?: string;
  periode?: number;
  days?: string;
  months?: string;
  year?: string;
  member?: string;
  organizationId?: string;
  pagination?: PaginationType;
};

export type GetOneUsersSelections = {
  email?: User['email'];
  userId?: User['id'];
  provider?: User['provider'];
  organizationId?: User['organizationId'];
};

export type UpdateUsersSelections = {
  userId?: User['id'];
  organizationId?: User['organizationId'];
};

export type CreateUsersOptions = Partial<User>;

export type UpdateUsersOptions = Partial<User>;

export const checkIfPasswordMatch = async (
  userPassword: string,
  password: string,
) => {
  return await argon2.verify(String(userPassword), String(password));
};

export const hashPassword = async (password: string) => {
  return await argon2.hash(String(password), {
    type: argon2.argon2id,
    hashLength: 32,
    memoryCost: 2 ** 16,
    parallelism: 4,
  });
};

export const UserSelect = {
  createdAt: true,
  id: true,
  email: true,
  member: true,
  confirmedAt: true,
  profile: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      occupation: true,
      address: true,
      phone: true,
      photo: true,
      description: true,
      currency: {
        select: {
          name: true,
          symbol: true,
        },
      },
      country: {
        select: {
          name: true,
        },
      },
    },
  },
  _count: {
    select: {
      contributors: true,
    },
  },
  organizationId: true,
  organization: {
    select: {
      name: true,
      description: true,
      assignTypes: {
        select: {
          animalTypeId: true,
          userId: true,
        },
      },
    },
  },
};
