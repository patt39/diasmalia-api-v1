import { Module } from '@nestjs/common';
import { DeathsController } from './deaths.controller';
import { DeathsService } from './deaths.service';

@Module({
  controllers: [DeathsController],
  providers: [DeathsService],
})
export class DeathsModule {}
