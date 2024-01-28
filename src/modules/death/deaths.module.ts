import { Module } from '@nestjs/common';
import { DeathsController } from './deaths.controller';
import { DeathsService } from './deaths.service';
import { AnimalsService } from '../animals/animals.service';

@Module({
  controllers: [DeathsController],
  providers: [DeathsService, AnimalsService],
})
export class DeathsModule {}
