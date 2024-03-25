import { Module } from '@nestjs/common';
import { BatchsService } from '../batchs/batchs.service';
import { DeathsService } from '../death/deaths.service';
import { UsersService } from '../users/users.service';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';

@Module({
  controllers: [SalesController],
  providers: [SalesService, DeathsService, UsersService, BatchsService],
})
export class SalesModule {}
