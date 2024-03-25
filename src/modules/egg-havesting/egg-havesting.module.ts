import { Module } from '@nestjs/common';
import { BatchsService } from '../batchs/batchs.service';
import { EggHavestingsController } from './egg-havesting.controller';
import { EggHavestingsService } from './egg-havesting.service';

@Module({
  controllers: [EggHavestingsController],
  providers: [EggHavestingsService, BatchsService],
})
export class EggHavestingsModule {}
