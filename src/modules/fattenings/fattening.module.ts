import { Module } from '@nestjs/common';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { AnimalsService } from '../animals/animals.service';
import { AssignTypesService } from '../assigne-type/assigne-type.service';
import { FatteningsController } from './fattening.controller';
import { FatteningsService } from './fattening.service';

@Module({
  controllers: [FatteningsController],
  providers: [
    AnimalsService,
    FatteningsService,
    ActivityLogsService,
    AssignTypesService,
  ],
})
export class FatteningsModule {}
