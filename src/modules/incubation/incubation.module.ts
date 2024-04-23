import { Module } from '@nestjs/common';
import { AnimalsService } from '../animals/animals.service';
import { AssignTypesService } from '../assigne-type/assigne-type.service';
import { IncubationsController } from './incubation.controller';
import { IncubationsService } from './incubation.service';

@Module({
  controllers: [IncubationsController],
  providers: [IncubationsService, AnimalsService, AssignTypesService],
})
export class IncubationsModule {}
