import { Module } from '@nestjs/common';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { AnimalsService } from '../animals/animals.service';
import { AssignTypesService } from '../assigne-type/assigne-type.service';
import { CagesController } from './cages.controller';
import { CagesService } from './cages.service';

@Module({
  controllers: [CagesController],
  providers: [
    CagesService,
    AnimalsService,
    ActivityLogsService,
    AssignTypesService,
  ],
})
export class CagesModule {}
