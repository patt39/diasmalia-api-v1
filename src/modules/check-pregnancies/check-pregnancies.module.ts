import { Module } from '@nestjs/common';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { AnimalsService } from '../animals/animals.service';
import { AssignTypesService } from '../assigne-type/assigne-type.service';
import { BreedingsService } from '../breedings/breedings.service';
import { GestationsService } from '../gestation/gestations.service';
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
  ],
})
export class CheckPregnanciesModule {}
