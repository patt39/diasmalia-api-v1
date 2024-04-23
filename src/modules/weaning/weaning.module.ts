import { Module } from '@nestjs/common';
import { AnimalsService } from '../animals/animals.service';
import { AssignTypesService } from '../assigne-type/assigne-type.service';
import { FarrowingsService } from '../farrowings/farrowings.service';
import { WeaningsController } from './weaning.controller';
import { WeaningsService } from './weaning.service';

@Module({
  controllers: [WeaningsController],
  providers: [
    WeaningsService,
    AnimalsService,
    FarrowingsService,
    AssignTypesService,
  ],
})
export class WeaningsModule {}
