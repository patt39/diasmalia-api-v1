import { Module } from '@nestjs/common';
import { CurrenciesService } from '../currency/currency.service';
import { UploadsUtil } from '../integrations/integration.utils';
import { UsersService } from '../users/users.service';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';

@Module({
  controllers: [OrganizationsController],
  providers: [
    OrganizationsService,
    UploadsUtil,
    CurrenciesService,
    UsersService,
  ],
})
export class OrganizationsModule {}
