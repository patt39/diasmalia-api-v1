import { Module } from '@nestjs/common';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { AnimalsService } from '../animals/animals.service';
import { AssignTypesService } from '../assigne-type/assigne-type.service';
import { DeathsController } from './deaths.controller';
import { DeathsService } from './deaths.service';

@Module({
  controllers: [DeathsController],
  providers: [
    DeathsService,
    AnimalsService,
    ActivityLogsService,
    AssignTypesService,
  ],
})
export class DeathsModule {}
