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
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { reply } from '../../app/utils/reply';

import { RequestPaginationDto } from '../../app/utils/pagination/request-pagination.dto';
import {
  PaginationType,
  addPagination,
} from '../../app/utils/pagination/with-pagination';
import { SearchQueryDto } from '../../app/utils/search-query/search-query.dto';

import {
  AddContributorUserDto,
  CreateOneContributorUserDto,
  CreateOrUpdateContributorDto,
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

  /** Post one Contributor */
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
        HttpStatus.OK,
      );

    await this.contributorsService.createOne({
      role: 'ADMIN',
      userId: findOneUser.id,
      userCreatedId: findOneUser.id,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: 'Contributor saved successfully' });
  }

  /** Post one Contributor */
  @Post(`/new-contributor`)
  @UseGuards(JwtAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOneContributorUserDto,
  ) {
    const { user } = req;
    const { email, lastName, firstName, phone } = body;

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
      phone,
      userId: newUser.id,
    });

    await this.contributorsService.createOne({
      role: 'ADMIN',
      userId: newUser.id,
      organizationId: newUser.organizationId,
      userCreatedId: user.id,
    });

    return reply({ res, results: 'Contributor saved successfully' });
  }

  /** Update one Contributor */
  @Put(`/:contributorId`)
  @UseGuards(JwtAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateContributorDto,
    @Param('contributorId', ParseUUIDPipe) contributorId: string,
  ) {
    const { role } = body;
    const { user } = req;

    const fineOnecontributor = await this.contributorsService.findOneBy({
      contributorId,
    });

    if (!fineOnecontributor) {
      throw new HttpException(
        `${contributorId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    const contributor = await this.contributorsService.updateOne(
      { contributorId },
      {
        role,
        userCreatedId: user?.id,
        updatedAt: new Date(),
      },
    );

    return reply({ res, results: contributor });
  }

  /** Get all contributors */
  @Get(`/`)
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Res() res,
    @Req() req,
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() query: SearchQueryDto,
  ) {
    const { user } = req;
    const { search } = query;

    const { take, page, sort } = requestPaginationDto;
    const pagination: PaginationType = addPagination({ page, take, sort });

    const contributors = await this.contributorsService.findAll({
      search,
      pagination,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: contributors });
  }

  /** Get one contributor */
  @Get(`/show/:contributorId`)
  // @UseGuards(JwtAuthGuard)
  async getOneByIdUser(
    @Res() res,
    @Param('contributorId', ParseUUIDPipe) contributorId: string,
  ) {
    const fineOnecontributor = await this.contributorsService.findOneBy({
      contributorId,
    });

    if (!fineOnecontributor) {
      throw new HttpException(
        `${contributorId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    return reply({ res, results: fineOnecontributor });
  }

  /** Get all contributor created tasks */
  @Get(`/:contributorId/tasks`)
  // @UseGuards(JwtAuthGuard)
  async findAllContributorTasks(
    @Res() res,
    @Param('contributorId', ParseUUIDPipe) contributorId: string,
  ) {
    const fineOnecontributor = await this.contributorsService.findAllTasks({
      contributorId,
    });

    if (!fineOnecontributor) {
      throw new HttpException(
        `${contributorId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    return reply({ res, results: fineOnecontributor });
  }

  /** Delete one contributor */
  @Delete(`/delete/:contributorId`)
  // @UseGuards(JwtAuthGuard)
  async deleteOne(
    @Res() res,
    @Param('contributorId', ParseUUIDPipe) contributorId: string,
  ) {
    const fineOnecontributor = await this.contributorsService.findOneBy({
      contributorId,
    });

    if (!fineOnecontributor) {
      throw new HttpException(
        `${contributorId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }
    const contributor = await this.contributorsService.updateOne(
      { contributorId },
      { deletedAt: new Date() },
    );

    return reply({ res, results: contributor });
  }
}
