import { Module } from '@nestjs/common';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { AnimalsService } from '../animals/animals.service';
import { BreedingsService } from '../breedings/breedings.service';
import { GestationsService } from '../gestation/gestations.service';
import { CheckPregnanciesController } from './check-pregnancies.controller';
import { CheckPregnanciesService } from './check-pregnancies.service';

@Module({
  controllers: [CheckPregnanciesController],
  providers: [
    AnimalsService,
    BreedingsService,
    GestationsService,
    ActivityLogsService,
    CheckPregnanciesService,
  ],
})
export class CheckPregnanciesModule {}
