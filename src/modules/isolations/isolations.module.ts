import { Module } from '@nestjs/common';
import { AnimalsService } from '../animals/animals.service';
import { IsolationsController } from './isolations.controller';
import { IsolationsService } from './isolations.service';

@Module({
  controllers: [IsolationsController],
  providers: [IsolationsService, AnimalsService],
})
export class IsolationsModule {}
