import { Module } from '@nestjs/common';
import { CheckPregnanciesController } from './check-pregnancies.controller';
import { CheckPregnanciesService } from './check-pregnancies.service';

@Module({
  controllers: [CheckPregnanciesController],
  providers: [CheckPregnanciesService],
})
export class CheckPregnanciesModule {}
