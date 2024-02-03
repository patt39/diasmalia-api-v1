import { Module } from '@nestjs/common';
import { AssignTasksService } from './assigntasks.service';
import { AssignTasksController } from './assigntasks.controller';
import { TasksService } from '../tasks/tasks.service';
import { UsersService } from '../users/users.service';

@Module({
  controllers: [AssignTasksController],
  providers: [AssignTasksService, UsersService, TasksService],
})
export class AssignTasksModule {}
