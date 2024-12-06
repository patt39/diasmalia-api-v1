import { Module } from '@nestjs/common';
import { ImagesService } from '../images/images.service';
import { UploadsUtil } from '../integrations/integration.utils';
import { AnimalTypesController } from './animal-type.controller';
import { AnimalTypesService } from './animal-type.service';

@Module({
  controllers: [AnimalTypesController],
  providers: [AnimalTypesService, UploadsUtil, ImagesService],
})
export class AnimalTypesModule {}
