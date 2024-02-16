import { Module } from '@nestjs/common';
import { SellingsController } from './sellings.controller';
import { SellingsService } from './sellings.service';
import { AnimalsService } from '../animals/animals.service';

@Module({
  controllers: [SellingsController],
  providers: [SellingsService, AnimalsService],
})
export class SellingsModule {}
