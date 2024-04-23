import { Module } from '@nestjs/common';
import { AnimalsService } from '../animals/animals.service';
import { AssignTypesService } from '../assigne-type/assigne-type.service';
import { FarrowingsController } from './farrowings.controller';
import { FarrowingsService } from './farrowings.service';

@Module({
  controllers: [FarrowingsController],
  providers: [FarrowingsService, AnimalsService, AssignTypesService],
})
export class FarrowingsModule {}
