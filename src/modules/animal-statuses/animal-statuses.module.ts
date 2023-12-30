import { Module } from '@nestjs/common';
import { AnimalStatusesController } from './animal-statuses.controller';
import { AnimalStatusesService } from './animal-statuses.service';

@Module({
  controllers: [AnimalStatusesController],
  providers: [AnimalStatusesService],
})
export class AnimalStatusesModule {}
