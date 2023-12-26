import { Module } from '@nestjs/common';
import { BreedingsController } from './breedings.controller';
import { BreedingsService } from './breedings.service';

@Module({
  controllers: [BreedingsController],
  providers: [BreedingsService],
})
export class BreedingsModule {}
