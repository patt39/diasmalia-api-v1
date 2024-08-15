import { Module } from '@nestjs/common';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { AnimalsService } from '../animals/animals.service';
import { EggHavestingsController } from './egg-havesting.controller';
import { EggHavestingsService } from './egg-havesting.service';

@Module({
  controllers: [EggHavestingsController],
  providers: [EggHavestingsService, AnimalsService, ActivityLogsService],
})
export class EggHavestingsModule {}
