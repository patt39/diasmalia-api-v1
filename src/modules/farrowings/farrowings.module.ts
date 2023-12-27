import { Module } from '@nestjs/common';
import { FarrowingsController } from './farrowings.controller';
import { FarrowingsService } from './farrowings.service';

@Module({
  controllers: [FarrowingsController],
  providers: [FarrowingsService],
})
export class FarrowingsModule {}
