import { Module } from '@nestjs/common';

import { ContributorsService } from './contributors.service';
import { ContributorsController } from './contributors.controller';
import { UsersService } from '../users/users.service';
import { ProfilesService } from '../profiles/profiles.service';
import { OrganizationsService } from '../organizations/organizations.service';
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
