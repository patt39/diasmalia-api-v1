import { Module } from '@nestjs/common';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { FinanceController } from './finances.controller';
import { FinancesService } from './finances.service';

@Module({
  controllers: [FinanceController],
  providers: [FinancesService, ActivityLogsService],
})
export class FinanceModule {}
