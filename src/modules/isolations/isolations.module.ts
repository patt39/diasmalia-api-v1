import { Module } from '@nestjs/common';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { AnimalsService } from '../animals/animals.service';
import { IsolationsController } from './isolations.controller';
import { IsolationsService } from './isolations.service';

@Module({
  controllers: [IsolationsController],
  providers: [IsolationsService, AnimalsService, ActivityLogsService],
})
export class IsolationsModule {}
