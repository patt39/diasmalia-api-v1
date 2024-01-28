import { Module } from '@nestjs/common';
import { FarrowingsController } from './farrowings.controller';
import { FarrowingsService } from './farrowings.service';
import { AnimalsService } from '../animals/animals.service';

@Module({
  controllers: [FarrowingsController],
  providers: [FarrowingsService, AnimalsService],
})
export class FarrowingsModule {}
