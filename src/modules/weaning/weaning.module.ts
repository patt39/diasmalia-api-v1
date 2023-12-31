import { Module } from '@nestjs/common';
import { WeaningsController } from './weaning.controller';
import { WeaningsService } from './weaning.service';

@Module({
  controllers: [WeaningsController],
  providers: [WeaningsService],
})
export class WeaningsModule {}
