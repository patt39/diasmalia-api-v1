import { Module } from '@nestjs/common';
import { BreedingsController } from './breedings.controller';
import { BreedingsService } from './breedings.service';
import { AnimalsService } from '../animals/animals.service';

@Module({
  controllers: [BreedingsController],
  providers: [BreedingsService, AnimalsService],
})
export class BreedingsModule {}
