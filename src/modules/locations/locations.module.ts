import { Module } from '@nestjs/common';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { AnimalsService } from '../animals/animals.service';
import { AssignTypesService } from '../assigne-type/assigne-type.service';
import { BuildingsService } from '../buildings/buildings.service';
import { LocationsController } from './locations.controller';
import { LocationsService } from './locations.service';

@Module({
  controllers: [LocationsController],
  providers: [
    LocationsService,
    AssignTypesService,
    ActivityLogsService,
    AnimalsService,
    BuildingsService,
  ],
})
export class LocationsModule {}
