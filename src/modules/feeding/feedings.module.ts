import { Module } from '@nestjs/common';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { AnimalsService } from '../animals/animals.service';
import { AssignTypesService } from '../assigne-type/assigne-type.service';
import { FeedStocksService } from '../feed-stock/feed-stock.service';
import { FeedingsController } from './feedings.controller';
import { FeedingsService } from './feedings.service';

@Module({
  controllers: [FeedingsController],
  providers: [
    FeedingsService,
    AnimalsService,
    FeedStocksService,
    ActivityLogsService,
    AssignTypesService,
  ],
})
export class FeedingsModule {}
