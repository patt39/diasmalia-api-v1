import { Module } from '@nestjs/common';
import { AnimalsService } from '../animals/animals.service';
import { AssignTypesService } from '../assigne-type/assigne-type.service';
import { CastrationsController } from './castrations.controller';
import { CastrationsService } from './castrations.service';

@Module({
  controllers: [CastrationsController],
  providers: [CastrationsService, AnimalsService, AssignTypesService],
})
export class CastrationsModule {}
