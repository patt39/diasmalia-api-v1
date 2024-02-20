import { Module } from '@nestjs/common';
import { FinancialAccountService } from '../financialAccount/financialAccount.service';
import { FinancialDetailService } from '../financialDetails/financialDetails.service';
import { FinancialMgtController } from './financialMgt.controller';
import { FinancialMgtService } from './financialMgt.service';

@Module({
  controllers: [FinancialMgtController],
  providers: [
    FinancialMgtService,
    FinancialDetailService,
    FinancialAccountService,
  ],
})
export class FinancialMgtModule {}
