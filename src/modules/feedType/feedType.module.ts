import { Module } from '@nestjs/common';
import { FeedTypeController } from './feedType.controller';
import { FeedTypeService } from './feedType.service';

@Module({
  controllers: [FeedTypeController],
  providers: [FeedTypeService],
})
export class FeedTypeModule {}
