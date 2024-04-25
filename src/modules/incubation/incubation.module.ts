import { Module } from '@nestjs/common';
import { AnimalsService } from '../animals/animals.service';
import { AssignTypesService } from '../assigne-type/assigne-type.service';
import { EggHavestingsService } from '../egg-havesting/egg-havesting.service';
import { IncubationsController } from './incubation.controller';
import { IncubationsService } from './incubation.service';

@Module({
  controllers: [IncubationsController],
  providers: [
    IncubationsService,
    AnimalsService,
    AssignTypesService,
    EggHavestingsService,
  ],
})
export class IncubationsModule {}
