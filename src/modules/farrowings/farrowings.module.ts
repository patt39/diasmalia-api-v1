import { Module } from '@nestjs/common';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { AnimalsService } from '../animals/animals.service';
import { FarrowingsController } from './farrowings.controller';
import { FarrowingsService } from './farrowings.service';

@Module({
  controllers: [FarrowingsController],
  providers: [FarrowingsService, AnimalsService, ActivityLogsService],
})
export class FarrowingsModule {}
