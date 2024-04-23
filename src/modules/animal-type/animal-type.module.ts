import { Module } from '@nestjs/common';
import { AnimalTypesController } from './animal-type.controller';
import { AnimalTypesService } from './animal-type.service';

@Module({
  controllers: [AnimalTypesController],
  providers: [AnimalTypesService],
})
export class AnimalTypesModule {}
