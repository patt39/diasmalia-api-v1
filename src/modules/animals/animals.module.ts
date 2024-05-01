import { Module } from '@nestjs/common';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { AnimalTypesService } from '../animal-type/animal-type.service';
import { AssignTypesService } from '../assigne-type/assigne-type.service';
import { BreedsService } from '../breeds/breeds.service';
import { CastrationsService } from '../castrations/castrations.service';
import { UploadsUtil } from '../integrations/integration.utils';
import { IsolationsService } from '../isolations/isolations.service';
import { LocationsService } from '../locations/locations.service';
import { AnimalsController } from './animals.controller';
import { AnimalsService } from './animals.service';

@Module({
  controllers: [AnimalsController],
  providers: [
    AnimalsService,
    LocationsService,
    BreedsService,
    UploadsUtil,
    ActivityLogsService,
    IsolationsService,
    CastrationsService,
    AnimalTypesService,
    AssignTypesService,
  ],
})
export class AnimalsModule {}
