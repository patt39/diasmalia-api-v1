import { Module } from '@nestjs/common';
import { MilkingsController } from './milkings.controller';
import { MilkingsService } from './milkings.service';

@Module({
  controllers: [MilkingsController],
  providers: [MilkingsService],
})
export class MilkingsModule {}
