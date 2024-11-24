import { Module } from '@nestjs/common';
import { UploadsUtil } from '../integrations/integration.utils';
import { MaterialController } from './material.controller';
import { MaterialService } from './material.service';

@Module({
  controllers: [MaterialController],
  providers: [MaterialService, UploadsUtil],
})
export class MaterialsModule {}
