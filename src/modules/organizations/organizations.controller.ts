import {
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Res,
  UseGuards,
} from '@nestjs/common';
import { reply } from '../../app/utils/reply';

import { JwtAuthGuard } from '../users/middleware';
import { OrganizationsService } from './organizations.service';

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  /** Get one Organizations */
  @Get(`/show/:organizationId`)
  @UseGuards(JwtAuthGuard)
  async getOneByIdUser(
    @Res() res,
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
  ) {
    const organization = await this.organizationsService.findOneBy({
      organizationId,
    });
    if (!organization)
      throw new HttpException(
        `OrganizationId: ${organizationId} doesn't exists, please change`,
        HttpStatus.NOT_FOUND,
      );

    return reply({ res, results: organization });
  }

  /** Delete Organization */
  @Delete(`/delete/:organizationId`)
  @UseGuards(JwtAuthGuard)
  async deleteOne(
    @Res() res,
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
  ) {
    const findOrganization = await this.organizationsService.findOneBy({
      organizationId,
    });
    if (!findOrganization)
      throw new HttpException(
        `OrganizationId: ${organizationId} doesn't exists, please change`,
        HttpStatus.NOT_FOUND,
      );

    const Organization = await this.organizationsService.updateOne(
      { organizationId },
      { deletedAt: new Date() },
    );

    return reply({ res, results: Organization });
  }
}
