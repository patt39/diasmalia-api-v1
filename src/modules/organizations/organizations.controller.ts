import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Res,
} from '@nestjs/common';
import { reply } from '../../app/utils/reply';

import { OrganizationsService } from './organizations.service';

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  /** Get one Organizations */
  @Get(`/show/:organizationId`)
  // @UseGuards(JwtAuthGuard)
  async getOneByIdUser(
    @Res() res,
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
  ) {
    const organization = await this.organizationsService.findOneBy({
      organizationId,
    });

    return reply({ res, results: organization });
  }

  /** Delete one Organizations */
  @Delete(`/delete/:organizationId`)
  // @UseGuards(JwtAuthGuard)
  async deleteOne(
    @Res() res,
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
  ) {
    const Organization = await this.organizationsService.updateOne(
      { organizationId },
      { deletedAt: new Date() },
    );

    return reply({ res, results: Organization });
  }
}
