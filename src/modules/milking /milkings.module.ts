import { Module } from '@nestjs/common';
import { MilkingsController } from './milkings.controller';
import { MilkingsService } from './milkings.service';
import { AnimalsService } from '../animals/animals.service';

@Module({
  controllers: [MilkingsController],
  providers: [MilkingsService, AnimalsService],
})
export class MilkingsModule {}
