import { Module } from '@nestjs/common';
import { AssignTypesService } from '../assigne-type/assigne-type.service';
import { EggHavestingsService } from '../egg-havesting/egg-havesting.service';
import { FeedingsService } from '../feeding/feedings.service';
import { AnalyticsController } from './analytics.controller';

@Module({
  controllers: [AnalyticsController],
  providers: [EggHavestingsService, AssignTypesService, FeedingsService],
})
export class AnalyticsModule {}
