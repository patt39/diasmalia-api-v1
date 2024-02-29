import { Module } from '@nestjs/common';
import { AnimalsService } from '../animals/animals.service';
import { BreedingsService } from '../breedings/breedings.service';
import { FeedingsController } from './feedings.controller';
import { FeedingsService } from './feedings.service';

@Module({
  controllers: [FeedingsController],
  providers: [FeedingsService, AnimalsService, BreedingsService],
})
export class FeedingsModule {}
