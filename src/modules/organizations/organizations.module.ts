import { Module } from '@nestjs/common';
import { AnimalsService } from '../animals/animals.service';
import { AssignTypesService } from '../assigne-type/assigne-type.service';
import { CurrenciesService } from '../currency/currency.service';
import { ImagesService } from '../images/images.service';
import { UsersService } from '../users/users.service';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';

@Module({
  controllers: [OrganizationsController],
  providers: [
    OrganizationsService,
    CurrenciesService,
    UsersService,
    ImagesService,
    AnimalsService,
    AssignTypesService,
  ],
})
export class OrganizationsModule {}
