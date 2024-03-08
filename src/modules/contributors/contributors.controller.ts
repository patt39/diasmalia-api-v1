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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { config } from '../../app/config';
import { RequestPaginationDto } from '../../app/utils/pagination/request-pagination.dto';
import {
  PaginationType,
  addPagination,
} from '../../app/utils/pagination/with-pagination';
import { reply } from '../../app/utils/reply';
import { SearchQueryDto } from '../../app/utils/search-query/search-query.dto';

import { FileInterceptor } from '@nestjs/platform-express';
import {
  CreateOneContributorUserDto,
  CreateOrUpdateContributorDto,
  GetContributorsByRoleDto,
} from '../contributors/contributors.dto';
import { UploadsUtil } from '../integrations/integration.utils';
import { ProfilesService } from '../profiles/profiles.service';
import { authPasswordResetMail } from '../users/mails/auth-password-reset-mail';
import { UserAuthGuard } from '../users/middleware';
import { CheckUserService } from '../users/middleware/check-user.service';
import { UsersService } from '../users/users.service';
import { ContributorsService } from './contributors.service';

@Controller('contributors')
export class ContributorsController {
  constructor(
    private readonly usersService: UsersService,
    private readonly profilesService: ProfilesService,
    private readonly contributorsService: ContributorsService,
    private readonly uploadsUtil: UploadsUtil,
    private readonly checkUserService: CheckUserService,
  ) {}

  /** Post one Contributor */
  @Post(`/new`)
  @UseGuards(UserAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOneContributorUserDto,
  ) {
    const { user } = req;
    const {
      email,
      phone,
      address,
      lastName,
      firstName,
      occupation,
      companyName,
    } = body;

    const findOneUser = await this.usersService.findOneBy({ email });
    if (findOneUser)
      throw new HttpException(
        `Email ${email} already exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const newUser = await this.usersService.createOne({
      provider: 'default',
      email: email.toLocaleLowerCase(),
      organizationId: user?.organizationId,
    });

    await this.profilesService.createOne({
      phone,
      address,
      lastName,
      firstName,
      occupation,
      companyName,
      userId: newUser?.id,
    });

    await this.contributorsService.createOne({
      role: 'ADMIN',
      userId: newUser?.id,
      organizationId: newUser?.organizationId,
      userCreatedId: user?.id,
    });

    const tokenVerify = await this.checkUserService.createTokenCookie(
      { userId: newUser?.id },
      config.cookie_access.user.accessExpireVerify,
    );

    await authPasswordResetMail({
      email,
      tokenVerify,
    });

    return reply({ res, results: 'Contributor saved successfully' });
  }

  @Get(`/profile/show`)
  @UseGuards(UserAuthGuard)
  async getOneByProfileId(@Res() res, @Req() req) {
    const { user } = req;
    const findOneProfile = await this.profilesService.findOneBy({
      profileId: user?.profile?.id,
    });
    if (!findOneProfile)
      throw new HttpException(
        `Profile doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    return reply({ res, results: findOneProfile });
  }

  @Put(`/profile/update/`)
  @UseGuards(UserAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async updateProfile(
    @Res() res,
    @Req() req,
    @Body() body: CreateOneContributorUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const { user } = req;

    const { fileName } = await this.uploadsUtil.uploadOneAWS({
      file,
      userId: user?.id,
      folder: 'animals_photos',
    });

    const {
      phone,
      address,
      lastName,
      firstName,
      occupation,
      companyName,
      description,
    } = body;
    await this.profilesService.updateOne(
      { profileId: user?.profile?.id },
      {
        phone,
        address,
        lastName,
        firstName,
        occupation,
        companyName,
        description,
        photo: fileName,
        userId: user?.id,
      },
    );

    return reply({ res, results: 'Profile updated successfully' });
  }

  /** Update Contributor Role */
  @Put(`/:contributorId/role/edit`)
  @UseGuards(UserAuthGuard)
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
      organizationId: user?.organizationId,
    });
    if (!fineOnecontributor)
      throw new HttpException(
        `ContributorId: ${contributorId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const contributor = await this.contributorsService.updateOne(
      { contributorId: fineOnecontributor?.id },
      { role },
    );

    return reply({ res, results: contributor });
  }

  /** Get all contributors */
  @Get(`/`)
  @UseGuards(UserAuthGuard)
  async findAll(
    @Res() res,
    @Req() req,
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() query: SearchQueryDto,
    @Query() queryRole: GetContributorsByRoleDto,
  ) {
    const { user } = req;
    const { search } = query;
    const { role } = queryRole;

    const { take, page, sort } = requestPaginationDto;
    const pagination: PaginationType = addPagination({ page, take, sort });

    const contributors = await this.contributorsService.findAll({
      role,
      search,
      pagination,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: contributors });
  }

  /** Get one contributor */
  @Get(`/show/:contributorId`)
  @UseGuards(UserAuthGuard)
  async getOneByIdUser(
    @Res() res,
    @Req() req,
    @Param('contributorId', ParseUUIDPipe) contributorId: string,
  ) {
    const { user } = req;

    const fineOnecontributor = await this.contributorsService.findOneBy({
      contributorId,
      organizationId: user?.organizationId,
    });
    if (!fineOnecontributor)
      throw new HttpException(
        `ContributorId: ${contributorId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    return reply({ res, results: fineOnecontributor });
  }

  /** Delete one contributor */
  @Delete(`/delete/:contributorId`)
  @UseGuards(UserAuthGuard)
  async deleteOne(
    @Res() res,
    @Req() req,
    @Param('contributorId', ParseUUIDPipe) contributorId: string,
  ) {
    const { user } = req;

    const fineOnecontributor = await this.contributorsService.findOneBy({
      contributorId,
      organizationId: user?.organizationId,
    });
    if (!fineOnecontributor)
      throw new HttpException(
        `ContributorId: ${contributorId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    await this.contributorsService.updateOne(
      { contributorId: fineOnecontributor?.id },
      { deletedAt: new Date() },
    );

    return reply({ res, results: 'Contributor deleted successfully' });
  }
}
