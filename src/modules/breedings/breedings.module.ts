import { Module } from '@nestjs/common';
import { AnimalsService } from '../animals/animals.service';
import { AssignTypesService } from '../assigne-type/assigne-type.service';
import { BreedingsController } from './breedings.controller';
import { BreedingsService } from './breedings.service';

@Module({
  controllers: [BreedingsController],
  providers: [BreedingsService, AnimalsService, AssignTypesService],
})
export class BreedingsModule {}
