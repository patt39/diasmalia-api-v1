import { Module } from '@nestjs/common';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { AnimalsService } from '../animals/animals.service';
import { AssignTypesService } from '../assigne-type/assigne-type.service';
import { FinancesService } from '../finances/finances.service';
import { UploadsUtil } from '../integrations/integration.utils';
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
    ActivityLogsService,
    AssignTypesService,
    FinancesService,
  ],
})
export class SalesModule {}
