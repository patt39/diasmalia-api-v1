import { Module } from '@nestjs/common';
import { BreedsController } from './breeds.controller';
import { BreedsService } from './breeds.service';

@Module({
  controllers: [BreedsController],
  providers: [BreedsService],
})
export class BreedsModule {}
