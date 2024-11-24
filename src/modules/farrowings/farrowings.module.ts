import { Module } from '@nestjs/common';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { AnimalsService } from '../animals/animals.service';
import { AssignTypesService } from '../assigne-type/assigne-type.service';
import { GestationsService } from '../gestation/gestations.service';
import { LocationsService } from '../locations/locations.service';
import { FarrowingsController } from './farrowings.controller';
import { FarrowingsService } from './farrowings.service';

@Module({
  controllers: [FarrowingsController],
  providers: [
    FarrowingsService,
    AnimalsService,
    ActivityLogsService,
    AssignTypesService,
    GestationsService,
    LocationsService,
  ],
})
export class FarrowingsModule {}
