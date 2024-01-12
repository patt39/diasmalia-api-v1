import { Module } from '@nestjs/common';
import { GestationsController } from './gestations.controller';
import { GestationsService } from './gestations.service';

@Module({
  controllers: [GestationsController],
  providers: [GestationsService],
})
export class GestationsModule {}
