import { Module } from '@nestjs/common';
import { UploadsUtil } from '../integrations/integration.utils';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';

@Module({
  controllers: [OrganizationsController],
  providers: [OrganizationsService, UploadsUtil],
})
export class OrganizationsModule {}
