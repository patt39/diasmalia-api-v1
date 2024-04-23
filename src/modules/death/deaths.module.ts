import { Module } from '@nestjs/common';
import { AnimalsService } from '../animals/animals.service';
import { AssignTypesService } from '../assigne-type/assigne-type.service';
import { SalesService } from '../sales/sales.service';
import { DeathsController } from './deaths.controller';
import { DeathsService } from './deaths.service';

@Module({
  controllers: [DeathsController],
  providers: [DeathsService, AnimalsService, SalesService, AssignTypesService],
})
export class DeathsModule {}
