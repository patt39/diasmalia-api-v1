import { Module } from '@nestjs/common';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { AssignTypesService } from '../assigne-type/assigne-type.service';
import { BuildingsController } from './buildings.controller';
import { BuildingsService } from './buildings.service';

@Module({
  controllers: [BuildingsController],
  providers: [BuildingsService, AssignTypesService, ActivityLogsService],
})
export class BuildingsModule {}
