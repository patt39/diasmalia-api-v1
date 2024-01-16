import { Module } from '@nestjs/common';
import { SellingsController } from './sellings.controller';
import { SellingsService } from './sellings.service';

@Module({
  controllers: [SellingsController],
  providers: [SellingsService],
})
export class SellingsModule {}
