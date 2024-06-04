import { Module } from '@nestjs/common';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { AnimalsService } from '../animals/animals.service';
import { AssignTypesService } from '../assigne-type/assigne-type.service';
import { DeathsService } from '../death/deaths.service';
import { UsersService } from '../users/users.service';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';

@Module({
  controllers: [SalesController],
  providers: [
    SalesService,
    AnimalsService,
    DeathsService,
    UsersService,
    ActivityLogsService,
    AssignTypesService,
  ],
})
export class SalesModule {}
