import { Module } from '@nestjs/common';
import { GestationsController } from './gestations.controller';
import { GestationsService } from './gestations.service';
import { AnimalsService } from '../animals/animals.service';
import { CheckPregnanciesService } from '../check-pregnancies/check-pregnancies.service';

@Module({
  controllers: [GestationsController],
  providers: [GestationsService, AnimalsService, CheckPregnanciesService],
})
export class GestationsModule {}
