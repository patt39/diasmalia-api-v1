import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Res,
} from '@nestjs/common';
import { reply } from '../../app/utils/reply';

import { ContributorsService } from '../contributors/contributors.service';
import { OrganizationsService } from '../organizations/organizations.service';
import { ProfilesService } from '../profiles/profiles.service';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly profilesService: ProfilesService,
    private readonly contributorsService: ContributorsService,
    private readonly organizationsService: OrganizationsService,
  ) {}

  /** Get one Users */
  @Get(`/show/:UserId`)
  // @UseGuards(JwtAuthGuard)
  async getOneByIdUser(
    @Res() res,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    const User = await this.usersService.findOneBy({
      userId,
    });

    return reply({ res, results: User });
  }

  /** Delete one Users */
  @Delete(`/delete/:userId`)
  // @UseGuards(JwtAuthGuard)
  async deleteOne(@Res() res, @Param('userId', ParseUUIDPipe) userId: string) {
    const User = await this.usersService.updateOne(
      { userId },
      { deletedAt: new Date() },
    );

    return reply({ res, results: User });
  }
}
