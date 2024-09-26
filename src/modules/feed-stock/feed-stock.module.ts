import { Module } from '@nestjs/common';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { AnimalsService } from '../animals/animals.service';
import { AssignTypesService } from '../assigne-type/assigne-type.service';
import { FeedStocksController } from './feed-stock.controller';
import { FeedStocksService } from './feed-stock.service';

@Module({
  controllers: [FeedStocksController],
  providers: [
    FeedStocksService,
    AnimalsService,
    ActivityLogsService,
    AssignTypesService,
  ],
})
export class FeedStockModule {}
