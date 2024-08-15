import { Module } from '@nestjs/common';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { AnimalsService } from '../animals/animals.service';
import { MilkingsController } from './milkings.controller';
import { MilkingsService } from './milkings.service';

@Module({
  controllers: [MilkingsController],
  providers: [MilkingsService, AnimalsService, ActivityLogsService],
})
export class MilkingsModule {}
