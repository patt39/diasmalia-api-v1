import { Module } from '@nestjs/common';
import { AnimalsService } from '../animals/animals.service';
import { AssignTypesService } from '../assigne-type/assigne-type.service';
import { EggHavestingsController } from './egg-havesting.controller';
import { EggHavestingsService } from './egg-havesting.service';

@Module({
  controllers: [EggHavestingsController],
  providers: [EggHavestingsService, AnimalsService, AssignTypesService],
})
export class EggHavestingsModule {}
