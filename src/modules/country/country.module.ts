import { Module } from '@nestjs/common';
import { CountriesController } from './country.controller';
import { CountriesService } from './country.service';

@Module({
  controllers: [CountriesController],
  providers: [CountriesService],
})
export class CountriesModule {}
