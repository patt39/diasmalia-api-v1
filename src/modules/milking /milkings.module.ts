import { Module } from '@nestjs/common';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { AnimalsService } from '../animals/animals.service';
import { AssignTypesService } from '../assigne-type/assigne-type.service';
import { MilkingsController } from './milkings.controller';
import { MilkingsService } from './milkings.service';

@Module({
  controllers: [MilkingsController],
  providers: [
    MilkingsService,
    AnimalsService,
    AssignTypesService,
    ActivityLogsService,
  ],
})
export class MilkingsModule {}
