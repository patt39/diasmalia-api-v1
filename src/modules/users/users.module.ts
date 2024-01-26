import { Module } from '@nestjs/common';
import { ContributorsService } from '../contributors/contributors.service';
import { ContributorsUtil } from '../contributors/contributors.util';
import { OrganizationsService } from '../organizations/organizations.service';
import { ProfilesService } from '../profiles/profiles.service';
import { JwtAuthStrategy } from './middleware';
import { CheckUserService } from './middleware/check-user.service';
import { UsersAuthController } from './users.auth.controller';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

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
