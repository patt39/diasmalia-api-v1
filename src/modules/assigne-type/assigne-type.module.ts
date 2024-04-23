import { Module } from '@nestjs/common';
import { AnimalTypesService } from '../animal-type/animal-type.service';
import { ContributorsService } from '../contributors/contributors.service';
import { AssignTypesController } from './assigne-type.controller';
import { AssignTypesService } from './assigne-type.service';

@Module({
  controllers: [AssignTypesController],
  providers: [AnimalTypesService, AssignTypesService, ContributorsService],
})
export class AssignTypesModule {}
