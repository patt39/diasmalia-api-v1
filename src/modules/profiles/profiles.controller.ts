import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { reply } from '../../app/utils/reply';

import { CreateOrUpdateProfilesDto } from './profiles.dto';
import { ProfilesService } from './profiles.service';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  /** Post one Profiles */
  @Post(`/`)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateProfilesDto,
  ) {
    const { firstName, lastName, phone, address, birthday } = body;

    const profile = await this.profilesService.createOne({
      firstName,
      lastName,
      address,
      phone,
      birthday,
      userId: '',
    });

    return reply({ res, results: profile });
  }

  /** Get one Profiles */
  @Get(`/show/:profileId`)
  // @UseGuards(JwtAuthGuard)
  async getOneByIdUser(
    @Res() res,
    @Param('profileId', ParseUUIDPipe) profileId: string,
  ) {
    const profile = await this.profilesService.findOneBy({ profileId });

    return reply({ res, results: profile });
  }

  /** Delete one Profiles */
  @Delete(`/delete/:profileId`)
  // @UseGuards(JwtAuthGuard)
  async deleteOne(
    @Res() res,
    @Param('profileId', ParseUUIDPipe) profileId: string,
  ) {
    const profile = await this.profilesService.updateOne(
      { profileId },
      { deletedAt: new Date() },
    );

    return reply({ res, results: profile });
  }
}
