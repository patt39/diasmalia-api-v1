import { Module } from '@nestjs/common';
import { BatchsService } from '../batchs/batchs.service';
import { DeathsController } from './deaths.controller';
import { DeathsService } from './deaths.service';

@Module({
  controllers: [DeathsController],
  providers: [DeathsService, BatchsService],
})
export class DeathsModule {}
