import { Module } from '@nestjs/common';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { AnimalsService } from '../animals/animals.service';
import { AssignTypesService } from '../assigne-type/assigne-type.service';
import { CastrationsController } from './castrations.controller';
import { CastrationsService } from './castrations.service';

@Module({
  controllers: [CastrationsController],
  providers: [
    AnimalsService,
    CastrationsService,
    AssignTypesService,
    ActivityLogsService,
  ],
})
export class CastrationsModule {}
