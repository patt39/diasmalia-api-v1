import { Module } from '@nestjs/common';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { AnimalsService } from '../animals/animals.service';
import { CheckPregnanciesService } from '../check-pregnancies/check-pregnancies.service';
import { GestationsController } from './gestations.controller';
import { GestationsService } from './gestations.service';

@Module({
  controllers: [GestationsController],
  providers: [
    GestationsService,
    AnimalsService,
    ActivityLogsService,
    CheckPregnanciesService,
  ],
})
export class GestationsModule {}
