import { Module } from '@nestjs/common';
import { AnimalTypesService } from '../animal-type/animal-type.service';
import { BreedsController } from './breeds.controller';
import { BreedsService } from './breeds.service';

@Module({
  controllers: [BreedsController],
  providers: [BreedsService, AnimalTypesService],
})
export class BreedsModule {}
