import { Module } from '@nestjs/common';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { AnimalsService } from '../animals/animals.service';
import { AssignTypesService } from '../assigne-type/assigne-type.service';
import { FinancesService } from '../finances/finances.service';
import { UploadsUtil } from '../integrations/integration.utils';
import { LocationsService } from '../locations/locations.service';
import { UsersService } from '../users/users.service';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';

@Module({
  controllers: [SalesController],
  providers: [
    UploadsUtil,
    SalesService,
    AnimalsService,
    UsersService,
    LocationsService,
    ActivityLogsService,
    AssignTypesService,
    FinancesService,
  ],
})
export class SalesModule {}
