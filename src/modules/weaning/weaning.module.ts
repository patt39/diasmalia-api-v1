import { Module } from '@nestjs/common';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { AnimalsService } from '../animals/animals.service';
import { FarrowingsService } from '../farrowings/farrowings.service';
import { WeaningsController } from './weaning.controller';
import { WeaningsService } from './weaning.service';

@Module({
  controllers: [WeaningsController],
  providers: [
    WeaningsService,
    AnimalsService,
    FarrowingsService,
    ActivityLogsService,
  ],
})
export class WeaningsModule {}
