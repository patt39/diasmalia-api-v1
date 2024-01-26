import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { reply } from '../../app/utils/reply';

import {
  AddContributorUserDto,
  CreateOneContributorUserDto,
} from '../contributors/contributors.dto';
import { OrganizationsService } from '../organizations/organizations.service';
import { ProfilesService } from '../profiles/profiles.service';
import { JwtAuthGuard } from '../users/middleware';
import { UsersService } from '../users/users.service';
import { ContributorsService } from './contributors.service';

@Controller('contributors')
export class ContributorsController {
  constructor(
    private readonly usersService: UsersService,
    private readonly profilesService: ProfilesService,
    private readonly contributorsService: ContributorsService,
    private readonly organizationsService: OrganizationsService,
  ) {}

  /** Post one Contributors */
  @Post(`/`)
  @UseGuards(JwtAuthGuard)
  async addOne(@Res() res, @Req() req, @Body() body: AddContributorUserDto) {
    const { user } = req;
    const { email } = body;

    const findOneUser = await this.usersService.findOneBy({ email });
    if (!findOneUser)
      throw new HttpException(
        `Email don't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneContributor = await this.contributorsService.findOneBy({
      userId: findOneUser.id,
      organizationId: user?.organizationId,
    });
    if (findOneContributor)
      throw new HttpException(
        `User already exists please change`,
        HttpStatus.NOT_FOUND,
      );

    await this.contributorsService.createOne({
      role: 'ADMIN',
      userId: findOneUser.id,
      userCreatedId: findOneUser.id,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: 'Contributor save successfully' });
  }

  /** Post one Contributors */
  @Post(`/new-contributor`)
  @UseGuards(JwtAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOneContributorUserDto,
  ) {
    const { user } = req;
    const { email, lastName, firstName } = body;

    const findOneUser = await this.usersService.findOneBy({ email });
    if (findOneUser)
      throw new HttpException(
        `Email ${email} already exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const newUser = await this.usersService.createOne({
      provider: 'default',
      email: email.toLocaleLowerCase(),
      organizationId: user.organizationId,
    });

    await this.profilesService.createOne({
      firstName,
      lastName,
      userId: newUser.id,
    });

    await this.contributorsService.createOne({
      role: 'ADMIN',
      userId: newUser.id,
      organizationId: newUser.organizationId,
      userCreatedId: user.id,
    });

    return reply({ res, results: 'Contributor save successfully' });
  }

  /** Get one Users */
  @Get(`/show/:contributorId`)
  // @UseGuards(JwtAuthGuard)
  async getOneByIdUser(
    @Res() res,
    @Param('contributorId', ParseUUIDPipe) contributorId: string,
  ) {
    const contributor = await this.contributorsService.findOneBy({
      contributorId,
    });

    return reply({ res, results: contributor });
  }

  /** Delete one Users */
  @Delete(`/delete/:contributorId`)
  // @UseGuards(JwtAuthGuard)
  async deleteOne(
    @Res() res,
    @Param('contributorId', ParseUUIDPipe) contributorId: string,
  ) {
    const contributor = await this.contributorsService.updateOne(
      { contributorId },
      { deletedAt: new Date() },
    );

    return reply({ res, results: contributor });
  }
}
