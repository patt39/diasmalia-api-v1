import { Module } from '@nestjs/common';
import { WeaningsController } from './weaning.controller';
import { WeaningsService } from './weaning.service';
import { AnimalsService } from '../animals/animals.service';
import { FarrowingsService } from '../farrowings/farrowings.service';

@Module({
  controllers: [WeaningsController],
  providers: [WeaningsService, AnimalsService, FarrowingsService],
})
export class WeaningsModule {}
