import { Module } from '@nestjs/common';
import { AnimalsService } from '../animals/animals.service';
import { AssignTypesService } from '../assigne-type/assigne-type.service';
import { FeedingsController } from './feedings.controller';
import { FeedingsService } from './feedings.service';

@Module({
  controllers: [FeedingsController],
  providers: [FeedingsService, AnimalsService, AssignTypesService],
})
export class FeedingsModule {}
