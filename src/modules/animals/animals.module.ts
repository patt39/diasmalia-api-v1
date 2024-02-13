import { Module } from '@nestjs/common';
import { BreedsService } from '../breeds/breeds.service';
import { LocationsService } from '../locations/locations.service';
import { AnimalsController } from './animals.controller';
import { AnimalsService } from './animals.service';

@Module({
  controllers: [AnimalsController],
  providers: [AnimalsService, LocationsService, BreedsService],
})
export class AnimalsModule {}
