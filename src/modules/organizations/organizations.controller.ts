import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { RequestPaginationDto } from '../../app/utils/pagination/request-pagination.dto';
import {
  addPagination,
  PaginationType,
} from '../../app/utils/pagination/with-pagination';
import { reply } from '../../app/utils/reply';
import { SearchQueryDto } from '../../app/utils/search-query/search-query.dto';
import { UserAuthGuard } from '../users/middleware';
import { UsersService } from '../users/users.service';
import {
  GetOrganizationQueryDto,
  UpdateOrganizationsDto,
} from './organizations.dto';
import { OrganizationsService } from './organizations.service';

@Controller('organization')
export class OrganizationsController {
  constructor(
    private readonly organizationsService: OrganizationsService,
    private readonly usersService: UsersService,
  ) {}

  /** Get all organizations */
  @Get(`/`)
  @UseGuards(UserAuthGuard)
  async findAll(
    @Res() res,
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() query: SearchQueryDto,
    @Query() queryOrganization: GetOrganizationQueryDto,
  ) {
    const { search } = query;
    const { userId } = queryOrganization;

    const { take, page, sort, sortBy } = requestPaginationDto;
    const pagination: PaginationType = addPagination({
      page,
      take,
      sort,
      sortBy,
    });

    const milkings = await this.organizationsService.findAll({
      search,
      userId,
      pagination,
    });

    return reply({ res, results: milkings });
  }

  /** Get one Organization */
  @Put(`/:organizationId/show`)
  @UseGuards(UserAuthGuard)
  async changeUserOrganization(
    @Res() res,
    @Req() req,
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
  ) {
    const { user } = req;
    const findOneOrganization = await this.organizationsService.findOneBy({
      organizationId,
    });
    if (!findOneOrganization)
      throw new HttpException(
        `OrganizationId: ${organizationId} doesn't exists, please change`,
        HttpStatus.NOT_FOUND,
      );

    const findUser = await this.usersService.updateOne(
      { userId: user?.id },
      { organizationId: findOneOrganization?.id },
    );

    return reply({ res, results: findUser });
  }

  /** Update organization */
  @Put(`/:organizationId/edit`)
  @UseGuards(UserAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: UpdateOrganizationsDto,
  ) {
    const { user } = req;
    const { name, description } = body;

    const findOrganization = await this.organizationsService.findOneBy({
      organizationId: user?.organizationId,
    });
    if (!findOrganization)
      throw new HttpException(
        `Organization doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    await this.organizationsService.updateOne(
      { organizationId: findOrganization?.id },
      {
        name,
        description: description.replace(/<\/?p>/g, ''),
      },
    );

    return reply({ res, results: 'Organization Updated Successfully' });
  }

  /** Get one Organization */
  @Get(`/:organizationId/view`)
  @UseGuards(UserAuthGuard)
  async getUserOrganization(
    @Res() res,
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
  ) {
    const findOneOrganization = await this.organizationsService.findOneBy({
      organizationId,
    });
    if (!findOneOrganization)
      throw new HttpException(
        `OrganizationId: ${organizationId} doesn't exists, please change`,
        HttpStatus.NOT_FOUND,
      );

    const findUser = await this.usersService.findOneBy({
      organizationId: findOneOrganization?.id,
    });

    return reply({ res, results: findUser });
  }

  /** Get one Organization */
  @Get(`/:userId/view/organization`)
  @UseGuards(UserAuthGuard)
  async getOrganizationByUserId(
    @Res() res,
    @Req() req,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    const { user } = req;
    const findOneUser = await this.usersService.findOneBy({
      userId,
      organizationId: user?.organizationId,
    });
    if (!findOneUser)
      throw new HttpException(
        `User doesn't exists, please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOrganization = await this.organizationsService.findOneBy({
      userId: findOneUser?.id,
    });

    return reply({ res, results: findOrganization });
  }

  /** Delete one Organization */
  @Delete(`/:organizationId/delete`)
  @UseGuards(UserAuthGuard)
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

    await this.organizationsService.updateOne(
      { organizationId: findOrganization.id },
      { deletedAt: new Date() },
    );

    return reply({ res, results: 'Organization Deleted Successfully' });
  }
}
