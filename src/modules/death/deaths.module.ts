import { Module } from '@nestjs/common';
import { AnimalsService } from '../animals/animals.service';
import { DeathsController } from './deaths.controller';
import { DeathsService } from './deaths.service';

@Module({
  controllers: [DeathsController],
  providers: [DeathsService, AnimalsService],
})
export class DeathsModule {}
