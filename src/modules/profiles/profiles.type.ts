import { Profile } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetProfilesSelections = {
  search?: string;
  pagination?: PaginationType;
};

export type GetOneProfilesSelections = {
  profileId?: Profile['id'];
};

export type UpdateProfilesSelections = {
  profileId: Profile['id'];
};

export type CreateProfilesOptions = Partial<Profile>;

export type UpdateProfilesOptions = Partial<Profile>;
