import { Module } from '@nestjs/common';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { AnimalTypesService } from '../animal-type/animal-type.service';
import { AssignTypesService } from '../assigne-type/assigne-type.service';
import { BreedsService } from '../breeds/breeds.service';
import { FarrowingsService } from '../farrowings/farrowings.service';
import { FatteningsService } from '../fattenings/fattening.service';
import { GestationsService } from '../gestation/gestations.service';
import { IsolationsService } from '../isolations/isolations.service';
import { LocationsService } from '../locations/locations.service';
import { UsersService } from '../users/users.service';
import { AnimalsController } from './animals.controller';
import { AnimalsService } from './animals.service';

@Module({
  controllers: [AnimalsController],
  providers: [
    AnimalsService,
    LocationsService,
    BreedsService,
    UsersService,
    GestationsService,
    FatteningsService,
    ActivityLogsService,
    IsolationsService,
    AnimalTypesService,
    AssignTypesService,
    FarrowingsService,
  ],
})
export class AnimalsModule {}
