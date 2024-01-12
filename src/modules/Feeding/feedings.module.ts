import { Module } from '@nestjs/common';
import { FeedingsController } from './feedings.controller';
import { FeedingsService } from './feedings.service';
import { AnimalsService } from '../animals/animals.service';

@Module({
  controllers: [FeedingsController],
  providers: [FeedingsService, AnimalsService],
})
export class FeedingsModule {}
