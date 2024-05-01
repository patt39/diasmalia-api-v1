import { Module } from '@nestjs/common';

import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { UploadsUtil } from '../integrations/integration.utils';
import { OrganizationsService } from '../organizations/organizations.service';
import { ProfilesService } from '../profiles/profiles.service';
import { CheckUserService } from '../users/middleware/check-user.service';
import { UsersService } from '../users/users.service';
import { ContributorsController } from './contributors.controller';
import { ContributorsService } from './contributors.service';

@Module({
  controllers: [ContributorsController],
  providers: [
    UploadsUtil,
    UsersService,
    ProfilesService,
    CheckUserService,
    ActivityLogsService,
    ContributorsService,
    OrganizationsService,
  ],
})
export class ContributorsModule {}
