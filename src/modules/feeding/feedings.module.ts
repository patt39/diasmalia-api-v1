import { Module } from '@nestjs/common';
import { BatchsService } from '../batchs/batchs.service';
import { FeedingsController } from './feedings.controller';
import { FeedingsService } from './feedings.service';

@Module({
  controllers: [FeedingsController],
  providers: [FeedingsService, BatchsService],
})
export class FeedingsModule {}
