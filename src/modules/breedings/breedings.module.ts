import { Module } from '@nestjs/common';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { AnimalsService } from '../animals/animals.service';
import { AssignTypesService } from '../assigne-type/assigne-type.service';
import { WeaningsService } from '../weaning/weaning.service';
import { BreedingsController } from './breedings.controller';
import { BreedingsService } from './breedings.service';

@Module({
  controllers: [BreedingsController],
  providers: [
    BreedingsService,
    AnimalsService,
    WeaningsService,
    ActivityLogsService,
    AssignTypesService,
  ],
})
export class BreedingsModule {}
