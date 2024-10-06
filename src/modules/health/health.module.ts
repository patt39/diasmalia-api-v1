import { Module } from '@nestjs/common';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { AnimalsService } from '../animals/animals.service';
import { AssignTypesService } from '../assigne-type/assigne-type.service';
import { HealthsController } from './health.controller';
import { HealthsService } from './health.service';

@Module({
  controllers: [HealthsController],
  providers: [
    HealthsService,
    AnimalsService,
    ActivityLogsService,
    AssignTypesService,
  ],
})
export class HealthModule {}
