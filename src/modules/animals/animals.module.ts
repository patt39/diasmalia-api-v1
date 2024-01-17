import { Module } from '@nestjs/common';
import { AnimalsController } from './animals.controller';
import { AnimalsService } from './animals.service';
import { LocationsService } from '../locations/locations.service';
import { BreedsService } from '../breeds/breeds.service';
import { AnimalStatusesService } from '../animal-statuses/animal-statuses.service';

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
