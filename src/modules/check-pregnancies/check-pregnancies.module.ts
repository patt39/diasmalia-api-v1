import { Module } from '@nestjs/common';
import { CheckPregnanciesController } from './check-pregnancies.controller';
import { CheckPregnanciesService } from './check-pregnancies.service';
import { AnimalsService } from '../animals/animals.service';
import { BreedingsService } from '../breedings/breedings.service';

@Module({
  controllers: [CheckPregnanciesController],
  providers: [CheckPregnanciesService, AnimalsService, BreedingsService],
})
export class CheckPregnanciesModule {}
