import { Module } from '@nestjs/common';
import { AnimalsService } from '../animals/animals.service';
import { DeathsService } from '../death/deaths.service';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';

@Module({
  controllers: [SalesController],
  providers: [SalesService, AnimalsService, DeathsService],
})
export class SalesModule {}
