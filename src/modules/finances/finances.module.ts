import { Module } from '@nestjs/common';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { AnimalsService } from '../animals/animals.service';
import { AssignTypesService } from '../assigne-type/assigne-type.service';
import { FinanceController } from './finances.controller';
import { FinancesService } from './finances.service';

@Module({
  controllers: [FinanceController],
  providers: [
    FinancesService,
    ActivityLogsService,
    AnimalsService,
    AssignTypesService,
  ],
})
export class FinanceModule {}
