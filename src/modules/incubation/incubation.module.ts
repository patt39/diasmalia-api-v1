import { Module } from '@nestjs/common';
import { BatchsService } from '../batchs/batchs.service';
import { IncubationsController } from './incubation.controller';
import { IncubationsService } from './incubation.service';

@Module({
  controllers: [IncubationsController],
  providers: [IncubationsService, BatchsService],
})
export class IncubationsModule {}
