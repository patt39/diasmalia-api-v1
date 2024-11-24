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
import { config } from '../../app/config';
import { RequestPaginationDto } from '../../app/utils/pagination/request-pagination.dto';
import {
  PaginationType,
  addPagination,
} from '../../app/utils/pagination/with-pagination';
import { reply } from '../../app/utils/reply';
import { SearchQueryDto } from '../../app/utils/search-query/search-query.dto';

import {
  AddContributorUserDto,
  CreateOneContributorUserDto,
  CreateOrUpdateContributorDto,
  GetContributorsDto,
} from '../contributors/contributors.dto';
import { UploadsUtil } from '../integrations/integration.utils';
import { ProfilesService } from '../profiles/profiles.service';
import { contributorInvitationMail } from '../users/mails/contribution-invitation-mail';
import { contributorCreateUserMail } from '../users/mails/contributor-create-user-mail';
import { UserAuthGuard } from '../users/middleware';
import {
  CheckUserService,
  JwtToken,
} from '../users/middleware/check-user.service';
import { UsersService } from '../users/users.service';
import { ContributorsService } from './contributors.service';

import { validation_verify_cookie_setting } from '../../app/utils/cookies';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { OrganizationsService } from '../organizations/organizations.service';
import { UpdateResetPasswordUserDto } from '../users/users.dto';
import { hashPassword } from '../users/users.type';

@Controller('contributors')
export class ContributorsController {
  constructor(
    private readonly usersService: UsersService,
    private readonly profilesService: ProfilesService,
    private readonly contributorsService: ContributorsService,
    private readonly uploadsUtil: UploadsUtil,
    private readonly organizationsService: OrganizationsService,
    private readonly activitylogsService: ActivityLogsService,
    private readonly checkUserService: CheckUserService,
  ) {}

  /** Get all contributors */
  @Get(`/`)
  @UseGuards(UserAuthGuard)
  async findAll(
    @Res() res,
    @Req() req,
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() query: SearchQueryDto,
    @Query() queryContributors: GetContributorsDto,
  ) {
    const { user } = req;
    const { search } = query;
    const { role, userId } = queryContributors;

    const { take, page, sort, sortBy } = requestPaginationDto;
    const pagination: PaginationType = addPagination({
      page,
      take,
      sort,
      sortBy,
    });

    const contributors = await this.contributorsService.findAll({
      role,
      search,
      userId,
      pagination,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: contributors });
  }

  /** Get all organizations */
  @Get(`/organizations`)
  @UseGuards(UserAuthGuard)
  async findAllOrganizations(
    @Res() res,
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() query: SearchQueryDto,
    @Query() queryContributors: GetContributorsDto,
  ) {
    const { search } = query;
    const { userId } = queryContributors;

    const { take, page, sort, sortBy } = requestPaginationDto;
    const pagination: PaginationType = addPagination({
      page,
      take,
      sort,
      sortBy,
    });

    const organizations = await this.contributorsService.findAll({
      search,
      userId,
      pagination,
    });

    return reply({ res, results: organizations });
  }

  /** Post one Contributor */
  @Post(`/new`)
  @UseGuards(UserAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOneContributorUserDto,
  ) {
    const { user } = req;
    const { email, phone, address, lastName, firstName, occupation } = body;

    const findOneContributor = await this.usersService.findOneBy({ email });
    if (findOneContributor)
      throw new HttpException(
        `Email: ${email} already exists please invite instead`,
        HttpStatus.NOT_FOUND,
      );

    const findOneUser = await this.contributorsService.findOneBy({
      userId: user?.id,
      organizationId: user?.organizationId,
    });
    if (findOneUser?.role !== 'SUPERADMIN')
      throw new HttpException(
        `User can't add a contributor please change`,
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
      userId: newUser?.id,
    });

    const contributor = await this.contributorsService.createOne({
      role: 'ADMIN',
      userId: newUser?.id,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    const contribitorOrganization = await this.organizationsService.createOne({
      name: `${firstName} ${lastName}`,
      userId: newUser?.id,
      description: `Farm projet of ${firstName} ${lastName}`,
    });

    await this.contributorsService.createOne({
      role: 'SUPERADMIN',
      userId: newUser?.id,
      confirmation: 'YES',
      confirmedAt: new Date(),
      organizationId: contribitorOrganization?.id,
      userCreatedId: user?.id,
    });

    const token = await this.checkUserService.createTokenCookie(
      {
        userId: newUser?.id,
        email: newUser?.email,
        contributorId: contributor?.id,
        organizationName: user?.organization?.name,
        inviter: `${user?.profile?.firstName} ${user?.profile?.lastName}`,
      } as JwtToken,
      config.cookie_access.user.accessExpireVerify,
    );

    await contributorCreateUserMail({ user, email, token });

    await this.activitylogsService.createOne({
      userId: user?.id,
      organizationId: user?.organizationId,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} added a new collaborator with ${contributor?.role} access`,
    });

    return reply({ res, results: 'Contributor saved successfully' });
  }

  /** Invite Contributor */
  @Post(`/invitation`)
  @UseGuards(UserAuthGuard)
  async inviteContributor(
    @Res() res,
    @Req() req,
    @Body() body: AddContributorUserDto,
  ) {
    const { user } = req;
    const { email } = body;

    const findOneUser = await this.usersService.findOneBy({ email });
    if (!findOneUser)
      throw new HttpException(
        `User doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneContributor = await this.contributorsService.findOneBy({
      userId: findOneUser?.id,
      organizationId: user?.organizationId,
    });
    if (findOneContributor)
      throw new HttpException(
        `Collaborator already invited`,
        HttpStatus.NOT_FOUND,
      );

    const contributor = await this.contributorsService.createOne({
      role: 'ADMIN',
      userId: findOneUser?.id,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    const token = await this.checkUserService.createTokenCookie(
      {
        reqUserId: user?.id,
        userId: findOneUser?.id,
        email: findOneUser?.email,
        contributorId: contributor?.id,
        organizationId: user?.organizationId,
        organizationName: user?.organization?.name,
        inviter: `${user?.profile?.firstName} ${user?.profile?.lastName}`,
      } as JwtToken,
      config.cookie_access.user.accessExpireVerify,
    );

    await contributorInvitationMail({ user, token, email });

    await this.activitylogsService.createOne({
      userId: user?.id,
      organizationId: user?.organizationId,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} invited ${findOneContributor?.user?.profile?.firstName} ${findOneContributor?.user.profile?.lastName}`,
    });

    res.cookie(
      config.cookie_access.user.nameVerify,
      token,
      validation_verify_cookie_setting,
    );

    return reply({ res, results: token });
  }

  /** Resend creation email */
  @Get(`/:userId/resend-email`)
  @UseGuards(UserAuthGuard)
  async resendCreationEmail(
    @Res() res,
    @Req() req,
    @Param('userId') userId: string,
  ) {
    const { user } = req;

    const findOneUser = await this.usersService.findOneBy({
      userId,
    });
    if (!findOneUser)
      throw new HttpException(
        `User doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const token = await this.checkUserService.createTokenCookie(
      {
        userId: findOneUser?.id,
        email: findOneUser?.email,
        organizationName: user?.organization?.name,
        inviter: `${user?.profile?.firstName} ${user?.profile?.lastName}`,
      } as JwtToken,
      config.cookie_access.user.accessExpireVerify,
    );

    await contributorCreateUserMail({ user, email: findOneUser?.email, token });

    return reply({ res, results: 'Email resend successfully' });
  }

  /** Resend creation email */
  @Get(`/:userId/invitation/resend-email`)
  @UseGuards(UserAuthGuard)
  async resendInvitationEmail(
    @Res() res,
    @Req() req,
    @Param('userId') userId: string,
  ) {
    const { user } = req;

    const findOneUser = await this.usersService.findOneBy({
      userId,
    });
    if (!findOneUser)
      throw new HttpException(
        `User doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneContributor = await this.contributorsService.findOneBy({
      userId: findOneUser?.id,
      organizationId: user?.organizationId,
    });

    const token = await this.checkUserService.createTokenCookie(
      {
        reqUserId: user?.id,
        userId: findOneUser?.id,
        email: findOneUser?.email,
        organizationId: user?.organizationId,
        contributorId: findOneContributor?.id,
        organizationName: user?.organization?.name,
        inviter: `${user?.profile?.firstName} ${user?.profile?.lastName}`,
      } as JwtToken,
      config.cookie_access.user.accessExpireVerify,
    );

    await contributorInvitationMail({ user, email: findOneUser?.email, token });

    return reply({ res, results: 'Email resend successfully' });
  }

  /** New contributor password reset with token */
  @Put(`/password/update/:token`)
  @UseGuards(UserAuthGuard)
  async contributorPasswordUpdate(
    @Res() res,
    @Body() body: UpdateResetPasswordUserDto,
  ) {
    const { password, token } = body;

    const payload = await this.checkUserService.verifyTokenCookie(token);
    const findOneUser = await this.usersService.findOneBy({
      email: payload?.email,
    });
    if (!findOneUser)
      throw new HttpException(`User invalid`, HttpStatus.NOT_FOUND);

    await this.usersService.updateOne(
      { userId: findOneUser.id },
      { password: await hashPassword(password), confirmedAt: new Date() },
    );

    const findOneContributor = await this.contributorsService.findOneBy({
      userId: findOneUser.id,
    });
    if (findOneContributor) {
      await this.contributorsService.updateOne(
        { contributorId: findOneContributor.id },
        { confirmedAt: new Date(), confirmation: 'YES' },
      );
    }

    return reply({ res, results: 'Password confirmed' });
  }

  /** Show Contributor */
  @Get(`/profile/show`)
  @UseGuards(UserAuthGuard)
  async getOneByProfileId(@Res() res, @Req() req) {
    const { user } = req;
    const findOneProfile = await this.profilesService.findOneBy({
      profileId: user.profile.id,
    });
    if (!findOneProfile)
      throw new HttpException(
        `Profile doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    return reply({ res, results: findOneProfile });
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

    await this.activitylogsService.createOne({
      userId: user?.id,
      organizationId: user?.organizationId,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} updated ${fineOnecontributor?.user?.profile?.firstName} ${fineOnecontributor?.user?.profile?.lastName} role`,
    });

    return reply({ res, results: contributor });
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
      organizationId: user.organizationId,
    });
    if (!fineOnecontributor)
      throw new HttpException(
        `ContributorId: ${contributorId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    return reply({ res, results: fineOnecontributor });
  }

  /** Delete one contributor */
  @Delete(`/:contributorId/delete`)
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
      { contributorId: fineOnecontributor.id },
      { deletedAt: new Date() },
    );

    await this.activitylogsService.createOne({
      userId: user?.id,
      organizationId: user?.organizationId,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} deleted ${fineOnecontributor?.user?.profile?.firstName}`,
    });

    return reply({ res, results: 'Contributor deleted successfully' });
  }
}
