import { Module } from '@nestjs/common';
import { FinancialMgtController } from './financialMgt.controller';
import { FinancialMgtService } from './financialMgt.service';
import { FinancialDetailService } from '../financialDetails/financialDetails.service';

@Module({
  controllers: [FinancialMgtController],
  providers: [FinancialMgtService, FinancialDetailService],
})
export class FinancialMgtModule {}
