import { Module } from '@nestjs/common';
import { FaqsController } from './faq.controller';
import { FaqsService } from './faq.service';

@Module({
  controllers: [FaqsController],
  providers: [FaqsService],
})
export class FaqsModule {}
