import { Module } from '@nestjs/common';
import { UploadsUtil } from '../integrations/integration.utils';
import { AnimalTypesController } from './animal-type.controller';
import { AnimalTypesService } from './animal-type.service';

@Module({
  controllers: [AnimalTypesController],
  providers: [AnimalTypesService, UploadsUtil],
})
export class AnimalTypesModule {}
