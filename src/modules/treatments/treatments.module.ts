import { Module } from '@nestjs/common';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { AnimalsService } from '../animals/animals.service';
import { AssignTypesService } from '../assigne-type/assigne-type.service';
import { HealthsService } from '../health/health.service';
import { SuggestionService } from '../suggestions/suggestions.service';
import { TreatmentsController } from './treatments.controller';
import { TreatmentsService } from './treatments.service';

@Module({
  controllers: [TreatmentsController],
  providers: [
    TreatmentsService,
    AnimalsService,
    ActivityLogsService,
    AssignTypesService,
    HealthsService,
    SuggestionService,
  ],
})
export class TreatmentsModule {}
