import { Module } from '@nestjs/common';
import { ContributorsService } from '../contributors/contributors.service';
import { CurrenciesService } from '../currency/currency.service';
import { UploadsUtil } from '../integrations/integration.utils';
import { OrganizationsService } from '../organizations/organizations.service';
import { ProfilesService } from '../profiles/profiles.service';
import { UserAuthStrategy, UserVerifyAuthStrategy } from './middleware';
import { CheckUserService } from './middleware/check-user.service';
import { UsersAuthController } from './users.auth.controller';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController, UsersAuthController],
  providers: [
    UsersService,
    UploadsUtil,
    CurrenciesService,
    CheckUserService,
    UserAuthStrategy,
    ProfilesService,
    ContributorsService,
    OrganizationsService,
    UserVerifyAuthStrategy,
  ],
})
export class UsersModule {}
