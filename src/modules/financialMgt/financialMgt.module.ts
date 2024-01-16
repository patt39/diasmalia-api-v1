import { Module } from '@nestjs/common';
import { FinancialMgtController } from './financialMgt.controller';
import { FinancialMgtService } from './financialMgt.service';

@Module({
  controllers: [FinancialMgtController],
  providers: [FinancialMgtService],
})
export class FinancialMgtModule {}
