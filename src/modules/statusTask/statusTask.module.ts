import { Module } from '@nestjs/common';
import { StatusTaskController } from './statusTask.controller';
import { StatusTaskService } from './statusTask.service';

@Module({
  controllers: [StatusTaskController],
  providers: [StatusTaskService],
})
export class DiagnosisModule {}
