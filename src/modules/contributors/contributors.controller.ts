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
  GetContributorsDto,
  InvitationConfirmationDto,
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
import { Cookies } from '../users/middleware/cookie.guard';
import { UpdateResetPasswordUserDto } from '../users/users.dto';
import { hashPassword } from '../users/users.type';

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
        `Email: ${email} already exists please invite instead`,
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

    const token = await this.checkUserService.createTokenCookie(
      { userId: newUser?.id, email: newUser.email } as JwtToken,
      config.cookie_access.user.accessExpireVerify,
    );

    await contributorCreateUserMail({
      user,
      email,
      token,
    });

    return reply({ res, results: 'Contributor saved successfully' });
  }

  /** Invite Contributor */
  @Post(`/invitation`)
  @UseGuards(UserAuthGuard)
  async inviteContributor(
    @Res() res,
    @Req() req,
    @Body() body: CreateOneContributorUserDto,
  ) {
    const { user } = req;
    const { email } = body;

    const findOneUser = await this.usersService.findOneBy({
      email,
      organizationId: user?.organizationId,
    });

    // if (findOneUser)
    //   throw new HttpException(
    //     `Email: ${email} already exists please change`,
    //     HttpStatus.NOT_FOUND,
    //   );

    // if (user?.email)
    //   throw new HttpException(
    //     `You are already a contributor`,
    //     HttpStatus.NOT_FOUND,
    //   );

    if (findOneUser) {
      await this.contributorsService.createOne({
        role: 'ADMIN',
        userId: findOneUser?.id,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
      });

      const token = await this.checkUserService.createTokenCookie(
        { email: findOneUser?.email } as JwtToken,
        config.cookie_access.user.accessExpireVerify,
      );

      await contributorInvitationMail({
        user,
        token,
        email: findOneUser?.email,
      });

      res.cookie(
        config.cookie_access.user.nameVerify,
        token,
        validation_verify_cookie_setting,
      );
    }

    return reply({ res, results: 'Contributor invited successfully' });
  }

  /** Resend invitation email */
  @Get(`/invitation/resend-email`)
  @UseGuards(UserAuthGuard)
  async resendInvitationEmail(@Res() res, @Req() req, @Cookies() cookies) {
    const { user } = req;
    const token = cookies[config.cookie_access.user.nameLogin];
    if (!token) {
      throw new HttpException(
        `Token not valid please change`,
        HttpStatus.NOT_FOUND,
      );
    }
    const payload = await this.checkUserService.verifyTokenCookie(token);
    const tokenUser = await this.checkUserService.createTokenCookie(
      { email: payload?.email } as JwtToken,
      config.cookie_access.user.accessExpireVerify,
    );
    const findOneUser = await this.usersService.findOneBy({
      email: payload?.email,
    });
    if (!findOneUser)
      throw new HttpException(
        `User doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    await contributorInvitationMail({
      user,
      token,
      email: findOneUser?.email,
    });

    res.cookie(
      config.cookie_access.user.nameVerify,
      tokenUser,
      validation_verify_cookie_setting,
    );

    return reply({ res, results: token });
  }

  /** Resend creation email */
  @Get(`/resend-email`)
  @UseGuards(UserAuthGuard)
  async resendCreationEmail(@Res() res, @Req() req, @Cookies() cookies) {
    const { user } = req;
    const token = cookies[config.cookie_access.user.nameLogin];
    console.log(token);
    if (!token) {
      throw new HttpException(
        `Token not valid please change`,
        HttpStatus.NOT_FOUND,
      );
    }
    const payload = await this.checkUserService.verifyTokenCookie(token);
    console.log(payload);
    const tokenUser = await this.checkUserService.createTokenCookie(
      { userId: payload.userId, email: payload?.email } as JwtToken,
      config.cookie_access.user.accessExpireVerify,
    );
    const findOneUser = await this.usersService.findOneBy({
      email: payload?.email,
    });
    console.log('user1 ====>', findOneUser);
    if (!findOneUser)
      throw new HttpException(
        `User doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    await contributorCreateUserMail({
      user,
      token,
      email: payload?.email,
    });

    res.cookie(
      config.cookie_access.user.nameVerify,
      tokenUser,
      findOneUser,
      validation_verify_cookie_setting,
    );

    return reply({ res, results: token });
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
    console.log(payload);
    const findOneUser = await this.usersService.findOneBy({
      email: payload?.email,
    });
    console.log('user ====>', findOneUser);
    if (!findOneUser)
      throw new HttpException(`User invalid`, HttpStatus.NOT_FOUND);

    await this.usersService.updateOne(
      { userId: findOneUser?.id },
      { password: await hashPassword(password), confirmedAt: new Date() },
    );

    const findOneContributor = await this.contributorsService.findOneBy({
      userId: findOneUser?.id,
    });
    console.log('contributor ====>', findOneContributor);

    if (findOneContributor) {
      await this.contributorsService.updateOne(
        { contributorId: findOneContributor?.id },
        { confirmedAt: new Date(), confirmation: 'YES' },
      );
    }

    return reply({
      res,
      results: 'Password confirmed',
    });
  }

  /** Contributor invitation confirmation*/
  @Put(`/invitation/:token`)
  async updatePassword(@Res() res, @Body() body: InvitationConfirmationDto) {
    const { confirmation, token } = body;
    const payload = await this.checkUserService.verifyTokenCookie(token);
    console.log(payload);
    const findOneUser = await this.usersService.findOneBy({
      email: payload?.email,
    });
    console.log('user ====>', findOneUser);
    if (!findOneUser)
      throw new HttpException(`User invalid`, HttpStatus.NOT_FOUND);
    if (!findOneUser)
      throw new HttpException(`User invalid`, HttpStatus.NOT_FOUND);

    const findOneContributor = await this.contributorsService.findOneBy({
      userId: findOneUser?.id,
    });
    console.log('contributor ====>', findOneContributor);

    if (confirmation === 'YES') {
      await this.contributorsService.updateOne(
        { contributorId: findOneContributor?.id },
        { confirmedAt: new Date(), confirmation: 'YES' },
      );
    }

    if (confirmation === 'NO') {
      await this.contributorsService.updateOne(
        { contributorId: findOneContributor?.id },
        { deletedAt: new Date(), confirmation: 'NO' },
      );
    }

    return reply({
      res,
      results: 'Invitation confirmed',
    });
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
      folder: 'photos',
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
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() query: SearchQueryDto,
    @Query() queryContributors: GetContributorsDto,
  ) {
    const { search } = query;
    const { role, organizationId } = queryContributors;

    const { take, page, sort } = requestPaginationDto;
    const pagination: PaginationType = addPagination({ page, take, sort });

    const contributors = await this.contributorsService.findAll({
      role,
      search,
      pagination,
      organizationId,
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
