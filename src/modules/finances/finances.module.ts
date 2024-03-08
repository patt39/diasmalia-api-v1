import { Module } from '@nestjs/common';
import { FinanceController } from './finances.controller';
import { FinancesService } from './finances.service';

@Module({
  controllers: [FinanceController],
  providers: [FinancesService],
})
export class FinanceModule {}
