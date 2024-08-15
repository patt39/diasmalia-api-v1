import { Module } from '@nestjs/common';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { AnimalTypesService } from '../animal-type/animal-type.service';
import { AssignTypesController } from './assigne-type.controller';
import { AssignTypesService } from './assigne-type.service';

@Module({
  controllers: [AssignTypesController],
  providers: [AnimalTypesService, AssignTypesService, ActivityLogsService],
})
export class AssignTypesModule {}
