import { Module } from '@nestjs/common';
import { AnimalsService } from '../animals/animals.service';
import { CurrenciesService } from '../currency/currency.service';
import { DeathsService } from '../death/deaths.service';
import { UsersService } from '../users/users.service';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';

@Module({
  controllers: [SalesController],
  providers: [
    SalesService,
    AnimalsService,
    DeathsService,
    UsersService,
    CurrenciesService,
  ],
})
export class SalesModule {}
