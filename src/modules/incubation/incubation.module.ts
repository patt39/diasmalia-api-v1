import { Module } from '@nestjs/common';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { AnimalsService } from '../animals/animals.service';
import { EggHavestingsService } from '../egg-havesting/egg-havesting.service';
import { IncubationsController } from './incubation.controller';
import { IncubationsService } from './incubation.service';

@Module({
  controllers: [IncubationsController],
  providers: [
    AnimalsService,
    IncubationsService,
    ActivityLogsService,
    EggHavestingsService,
  ],
})
export class IncubationsModule {}
