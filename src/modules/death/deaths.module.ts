import { Module } from '@nestjs/common';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { AnimalsService } from '../animals/animals.service';
import { AssignTypesService } from '../assigne-type/assigne-type.service';
import { IsolationsService } from '../isolations/isolations.service';
import { LocationsService } from '../locations/locations.service';
import { DeathsController } from './deaths.controller';
import { DeathsService } from './deaths.service';

@Module({
  controllers: [DeathsController],
  providers: [
    DeathsService,
    AnimalsService,
    LocationsService,
    ActivityLogsService,
    AssignTypesService,
    IsolationsService,
  ],
})
export class DeathsModule {}
