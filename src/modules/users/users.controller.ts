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
import {
  PaginationType,
  RequestPaginationDto,
  addPagination,
} from 'src/app/utils/pagination';
import { SearchQueryDto } from 'src/app/utils/search-query';
import { config } from '../../app/config/index';
import { reply } from '../../app/utils/reply';
import { ContributorsService } from '../contributors/contributors.service';
import { contributorRejectionMail } from './mails/contribution-rejection-mail';
import { UserAuthGuard } from './middleware';
import { CheckUserService } from './middleware/check-user.service';
import {
  ContributorConfirmDto,
  GetAdmins,
  UpdateOneEmailUserDto,
  UpdateUserPasswordDto,
} from './users.dto';
import { UsersService } from './users.service';
import { checkIfPasswordMatch, hashPassword } from './users.type';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly checkUserService: CheckUserService,
    private readonly contributorsService: ContributorsService,
  ) {}

  /** Get one User */
  @Get(`/me`)
  @UseGuards(UserAuthGuard)
  async getMe(@Res() res, @Req() req) {
    const { user } = req;
    const findOneUser = await this.usersService.findMe({
      userId: user.id,
      organizationId: user?.organizationId,
    });
    if (!findOneUser)
      throw new HttpException(`Invalid credentials`, HttpStatus.NOT_FOUND);

    const findOneContributor = await this.contributorsService.findOneBy({
      userId: user.id,
      organizationId: user?.organizationId,
    });
    if (!findOneUser)
      throw new HttpException(`Invalid credentials`, HttpStatus.NOT_FOUND);

    return reply({
      res,
      results: {
        ...findOneUser,
        ...findOneContributor,
      },
    });
  }

  /** Get users */
  @Get(`/`)
  @UseGuards(UserAuthGuard)
  async getUserOrganizations(
    @Res() res,
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() query: SearchQueryDto,
    @Query() queryAdmins: GetAdmins,
  ) {
    const { search } = query;
    const { member } = queryAdmins;

    const { take, page, sort } = requestPaginationDto;
    const pagination: PaginationType = addPagination({ page, take, sort });

    const users = await this.usersService.findAll({
      member,
      search,
      pagination,
    });

    return reply({ res, results: users });
  }

  /** Change status */
  @Put(`/:userId/change-status`)
  @UseGuards(UserAuthGuard)
  async changeStatus(
    @Res() res,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    const findOneUser = await this.usersService.findOneBy({
      userId,
    });
    if (!findOneUser)
      throw new HttpException(
        `UserId: ${findOneUser?.id} doesn't exists, please change`,
        HttpStatus.NOT_FOUND,
      );

    await this.usersService.updateOne(
      { userId: findOneUser?.id },
      { member: !findOneUser?.member },
    );

    return reply({ res, results: 'Status changed successfully' });
  }

  /** Change connected user password */
  @Put(`/change-password`)
  @UseGuards(UserAuthGuard)
  async UpdateUserPasswordDto(
    @Res() res,
    @Req() req,
    @Body() body: UpdateUserPasswordDto,
  ) {
    const { user } = req;
    const { newPassword } = body;

    if (!(await checkIfPasswordMatch(user?.password, newPassword)))
      throw new HttpException(`Invalid credentials`, HttpStatus.NOT_FOUND);

    await this.usersService.updateOne(
      { userId: user?.id },
      { password: await hashPassword(newPassword) },
    );

    return reply({ res, results: 'Password Updated successfully' });
  }

  /** New contributor confirmation */
  @Put(`/confirmation/:token`)
  async contributorPasswordUpdate(
    @Res() res,
    @Body() body: ContributorConfirmDto,
    @Param('token') token: string,
  ) {
    const { password } = body;

    if (!token) {
      throw new HttpException(
        `Token not valid please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    const payload = await this.checkUserService.verifyTokenCookie(token);
    const findOneUser = await this.usersService.findOneBy({
      email: payload?.email,
    });
    if (!findOneUser)
      throw new HttpException(`User invalid`, HttpStatus.NOT_FOUND);

    await this.usersService.updateOne(
      { userId: findOneUser?.id },
      { password: await hashPassword(password), confirmedAt: new Date() },
    );

    const findOneContributor = await this.contributorsService.findOneBy({
      contributorId: payload?.contributorId,
    });
    if (findOneContributor) {
      await this.contributorsService.updateOne(
        { contributorId: findOneContributor?.id },
        { confirmedAt: new Date(), confirmation: 'YES' },
      );
    }

    return reply({ res, results: 'Password confirmed' });
  }

  /** Invitation confirmation */
  @Put(`/invitation/confirmation/:token`)
  async collaboratorInvitationconfirmation(
    @Res() res,
    @Param('token') token: string,
  ) {
    if (!token) {
      throw new HttpException(
        `Token not valid please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    const payload = await this.checkUserService.verifyTokenCookie(token);

    const findOneContributor = await this.contributorsService.findOneBy({
      contributorId: payload?.contributorId,
    });
    if (findOneContributor) {
      await this.contributorsService.updateOne(
        { contributorId: findOneContributor?.id },
        { confirmedAt: new Date(), confirmation: 'YES' },
      );
    }

    return reply({ res, results: 'Invitation confirmed' });
  }

  /** Collaboration rejection */
  @Put(`/rejection/:token`)
  async collaborationRejection(@Res() res, @Param('token') token: string) {
    if (!token) {
      throw new HttpException(
        `Token not valid please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    const payload = await this.checkUserService.verifyTokenCookie(token);

    const findUser = await this.usersService.findOneBy({
      userId: payload?.reqUserId,
    });

    const findOneContributor = await this.contributorsService.findOneBy({
      contributorId: payload?.contributorId,
    });
    if (findOneContributor) {
      await this.contributorsService.updateOne(
        { contributorId: findOneContributor?.id },
        { confirmedAt: null, confirmation: 'NO' },
      );
    }

    await contributorRejectionMail({
      contributor: findOneContributor,
      email: findUser?.email,
    });

    return reply({ res, results: 'Collaboration rejected' });
  }

  /** Change connected user email */
  @Put(`/change-email`)
  @UseGuards(UserAuthGuard)
  async updateUserEmail(
    @Res() res,
    @Req() req,
    @Body() body: UpdateOneEmailUserDto,
  ) {
    const { user } = req;
    const { email } = body;

    const findOneUser = await this.usersService.findOneBy({
      email,
      userId: user?.id,
    });
    if (findOneUser) {
      await this.usersService.updateOne({ userId: user?.id }, { email: email });
    }

    return reply({ res, results: 'Email updated successfully' });
  }

  /** Get one user */
  @Get(`/:userId/show`)
  async findUserById(
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
        `userId: ${userId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    return reply({ res, results: findOneUser });
  }

  /** Delete user */
  @Delete(`/:userId/delete`)
  @UseGuards(UserAuthGuard)
  async deleteOneUser(
    @Res() res,
    @Req() req,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    const { user } = req;
    const findOneUser = await this.usersService.findOneBy({
      userId,
      organizationId: user?.organizationId,
    });

    if (!findOneUser && userId !== user?.id)
      throw new HttpException(
        `User ${userId} already not exists please change`,
        HttpStatus.NOT_FOUND,
      );

    await this.usersService.updateOne({ userId }, { deletedAt: new Date() });

    res.clearCookie(config.cookie_access.user.nameLogin);

    return reply({ res, results: 'User deleted successfully' });
  }

  /** Get users statistics */
  @Get(`/statistics`)
  @UseGuards(UserAuthGuard)
  async getAnimalStatistics(@Res() res) {
    const userStatistics = await this.usersService.getUsersTransactions();

    return reply({ res, results: userStatistics });
  }
}
