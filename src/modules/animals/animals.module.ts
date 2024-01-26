import { Module } from '@nestjs/common';
import { AnimalStatusesService } from '../animal-statuses/animal-statuses.service';
import { BreedsService } from '../breeds/breeds.service';
import { LocationsService } from '../locations/locations.service';
import { AnimalsController } from './animals.controller';
import { AnimalsService } from './animals.service';

@Module({
  controllers: [AnimalsController],
  providers: [
    AnimalsService,
    LocationsService,
    BreedsService,
    AnimalStatusesService,
  ],
})
export class AnimalsModule {}
