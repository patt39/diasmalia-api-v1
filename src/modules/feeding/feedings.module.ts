import { Module } from '@nestjs/common';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { AnimalsService } from '../animals/animals.service';
import { FeedingsController } from './feedings.controller';
import { FeedingsService } from './feedings.service';

@Module({
  controllers: [FeedingsController],
  providers: [FeedingsService, AnimalsService, ActivityLogsService],
})
export class FeedingsModule {}
