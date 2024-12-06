import { Module } from '@nestjs/common';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { AnimalsService } from '../animals/animals.service';
import { AssignTypesService } from '../assigne-type/assigne-type.service';
import { BreedingsService } from '../breedings/breedings.service';
import { FarrowingsService } from '../farrowings/farrowings.service';
import { GestationsService } from '../gestation/gestations.service';
import { LocationsService } from '../locations/locations.service';
import { WeaningsService } from '../weaning/weaning.service';
import { CheckPregnanciesController } from './check-pregnancies.controller';
import { CheckPregnanciesService } from './check-pregnancies.service';

@Module({
  controllers: [CheckPregnanciesController],
  providers: [
    AnimalsService,
    AssignTypesService,
    BreedingsService,
    GestationsService,
    ActivityLogsService,
    CheckPregnanciesService,
    LocationsService,
    WeaningsService,
    FarrowingsService,
  ],
})
export class CheckPregnanciesModule {}
