import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersAuthController } from './users.auth.controller';
import { OrganizationsService } from '../organizations/organizations.service';
import { ProfilesService } from '../profiles/profiles.service';
import { ContributorsService } from '../contributors/contributors.service';
import { CheckUserService } from './middleware/check-user.service';
import { JwtAuthStrategy } from './middleware';
import { ContributorsUtil } from '../contributors/contributors.util';

@Module({
  controllers: [UsersController, UsersAuthController],
  providers: [
    UsersService,
    OrganizationsService,
    ProfilesService,
    CheckUserService,
    JwtAuthStrategy,
    ContributorsUtil,
    ContributorsService,
  ],
})
export class UsersModule {}
