import { Module } from '@nestjs/common';
import { AssignTypesService } from '../assigne-type/assigne-type.service';
import { LocationsController } from './locations.controller';
import { LocationsService } from './locations.service';

@Module({
  controllers: [LocationsController],
  providers: [LocationsService, AssignTypesService],
})
export class LocationsModule {}
