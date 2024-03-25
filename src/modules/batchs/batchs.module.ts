import { Module } from '@nestjs/common';
import { BatchesController } from './batchs.controller';
import { BatchsService } from './batchs.service';

@Module({
  controllers: [BatchesController],
  providers: [BatchsService],
})
export class BatchsModule {}
