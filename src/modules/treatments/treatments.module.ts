import { Module } from '@nestjs/common';
import { BatchsService } from '../batchs/batchs.service';
import { TreatmentsController } from './treatments.controller';
import { TreatmentsService } from './treatments.service';

@Module({
  controllers: [TreatmentsController],
  providers: [TreatmentsService, BatchsService],
})
export class TreatmentsModule {}
