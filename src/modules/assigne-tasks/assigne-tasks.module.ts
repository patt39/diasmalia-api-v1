import { Module } from '@nestjs/common';
import { ContributorsService } from '../contributors/contributors.service';
import { TasksService } from '../tasks/tasks.service';
import { UsersService } from '../users/users.service';
import { AssignTasksController } from './assigne-tasks.controller';
import { AssignTasksService } from './assigne-tasks.service';

@Module({
  controllers: [AssignTasksController],
  providers: [
    AssignTasksService,
    UsersService,
    TasksService,
    ContributorsService,
  ],
})
export class AssignTasksModule {}
