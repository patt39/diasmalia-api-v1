import { Module } from '@nestjs/common';

import { OrganizationsService } from '../organizations/organizations.service';
import { ProfilesService } from '../profiles/profiles.service';
import { UsersService } from '../users/users.service';
import { ContributorsController } from './contributors.controller';
import { ContributorsService } from './contributors.service';
import { ContributorsUtil } from './contributors.util';

@Module({
  controllers: [ContributorsController],
  providers: [
    ContributorsService,
    UsersService,
    ProfilesService,
    ContributorsUtil,
    OrganizationsService,
  ],
})
export class ContributorsModule {}
