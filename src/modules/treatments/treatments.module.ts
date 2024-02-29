import { Module } from '@nestjs/common';
import { AnimalsService } from '../animals/animals.service';
import { TreatmentsController } from './treatments.controller';
import { TreatmentsService } from './treatments.service';

@Module({
  controllers: [TreatmentsController],
  providers: [TreatmentsService, AnimalsService],
})
export class TreatmentsModule {}
