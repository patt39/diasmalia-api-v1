import { Module } from '@nestjs/common';
import { ContactUsController } from './currency.controller';
import { CurrenciesService } from './currency.service';

@Module({
  controllers: [ContactUsController],
  providers: [CurrenciesService],
})
export class CurrenciesModule {}
