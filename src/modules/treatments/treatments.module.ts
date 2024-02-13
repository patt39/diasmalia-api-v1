import { Module } from '@nestjs/common';
import { AnimalsService } from '../animals/animals.service';
import { DiagnosisService } from '../diagnosis/diagnosis.service';
import { MedicationsService } from '../medications/medications.service';
import { TreatmentsController } from './treatments.controller';
import { TreatmentsService } from './treatments.service';

@Module({
  controllers: [TreatmentsController],
  providers: [
    TreatmentsService,
    DiagnosisService,
    MedicationsService,
    AnimalsService,
  ],
})
export class TreatmentsModule {}
