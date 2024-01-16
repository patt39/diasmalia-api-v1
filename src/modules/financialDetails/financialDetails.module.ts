import { Module } from '@nestjs/common';
import { FinancialDetailController } from './financialDetails.controller';
import { FinancialDetailService } from './financialDetails.service';

@Module({
  controllers: [FinancialDetailController],
  providers: [FinancialDetailService],
})
export class FinancialDetailModule {}
