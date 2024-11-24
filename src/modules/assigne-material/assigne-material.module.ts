import { Module } from '@nestjs/common';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { BuildingsService } from '../buildings/buildings.service';
import { LocationsService } from '../locations/locations.service';
import { MaterialService } from '../material/material.service';
import { AssignMaterialsController } from './assigne-material.controller';
import { AssignMaterialsService } from './assigne-material.service';

@Module({
  controllers: [AssignMaterialsController],
  providers: [
    MaterialService,
    AssignMaterialsService,
    ActivityLogsService,
    BuildingsService,
    LocationsService,
  ],
})
export class AssignMaterialsModule {}
