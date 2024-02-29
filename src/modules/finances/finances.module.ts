import { Module } from '@nestjs/common';
import { AccountService } from '../account/account.service';
import { FinanceController } from './finances.controller';
import { FinancesService } from './finances.service';

@Module({
  controllers: [FinanceController],
  providers: [FinancesService, AccountService],
})
export class FinanceModule {}
