import { Module } from '@nestjs/common';
import { AssignTasksService } from './assigntasks.service';
import { AssignTasksController } from './assigntasks.controller';
import { ContributorsService } from '../contributors/contributors.service';
import { TasksService } from '../tasks/tasks.service';

@Module({
  controllers: [AssignTasksController],
  providers: [AssignTasksService, ContributorsService, TasksService],
})
export class AssignTasksModule {}
