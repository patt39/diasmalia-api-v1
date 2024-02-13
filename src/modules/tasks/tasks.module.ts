import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { ContributorsService } from '../contributors/contributors.service';

@Module({
  controllers: [TasksController],
  providers: [TasksService, ContributorsService],
})
export class TasksModule {}
