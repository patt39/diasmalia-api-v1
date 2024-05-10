import { Module } from '@nestjs/common';
import { CurrenciesController } from './currency.controller';
import { CurrenciesService } from './currency.service';

@Module({
  controllers: [CurrenciesController],
  providers: [CurrenciesService],
})
export class CurrenciesModule {}
