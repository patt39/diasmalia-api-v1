import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Res,
} from '@nestjs/common';
import { reply } from '../../app/utils/reply';

import { ProfilesService } from './profiles.service';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  /** Get one Profile */
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
