import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import { config } from '../../app/config';
import { generateNumber, getIpRequest } from '../../app/utils/commons';
import {
  validation_login_cookie_setting,
  validation_verify_cookie_setting,
} from '../../app/utils/cookies';
import { reply } from '../../app/utils/reply';
import { ContributorsService } from '../contributors/contributors.service';
import { getOneLocationIpApi } from '../integrations/taux-live';
import { OrganizationsService } from '../organizations/organizations.service';
import { ProfilesService } from '../profiles/profiles.service';
import { authCodeConfirmationMail } from './mails/auth-code-confirmation-mail';
import { authPasswordResetMail } from './mails/auth-password-reset-mail';
import { UserVerifyAuthStrategy } from './middleware';
import { CheckUserService, JwtToken } from './middleware/check-user.service';
import { Cookies } from './middleware/cookie.guard';
import {
  ConfirmEmailUserDto,
  CreateLoginUserDto,
  RegisterUserDto,
  ResetPasswordUserDto,
  UpdateResetPasswordUserDto,
} from './users.dto';
import { UsersService } from './users.service';
import { checkIfPasswordMatch, hashPassword } from './users.type';

@Controller()
export class UsersAuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly profilesService: ProfilesService,
    private readonly checkUserService: CheckUserService,
    private readonly contributorsService: ContributorsService,
    private readonly organizationsService: OrganizationsService,
  ) {}

  /** Post one User */
  @Post(`/register`)
  async createOne(@Res() res, @Body() body: RegisterUserDto) {
    const { email, password, firstName, lastName, organizationName } = body;

    const findOneUser = await this.usersService.findOneBy({ email });
    if (findOneUser)
      throw new HttpException(
        `Email ${email} already exists please change`,
        HttpStatus.NOT_FOUND,
      );
    const user = await this.usersService.createOne({
      password: await hashPassword(password),
      provider: 'default',
      email: email.toLocaleLowerCase(),
    });

    await this.profilesService.createOne({
      firstName,
      lastName,
      userId: user?.id,
    });

    const organization = await this.organizationsService.createOne({
      name: organizationName,
      userId: user.id,
    });

    await this.usersService.updateOne(
      { userId: user.id },
      { organizationId: organization?.id },
    );

    await this.contributorsService.createOne({
      role: 'SUPERADMIN',
      userId: user?.id,
      confirmation: 'YES',
      confirmedAt: new Date(),
      organizationId: organization.id,
      userCreatedId: user.id,
    });

    const codeGenerate = generateNumber(6);
    const tokenUser = await this.checkUserService.createTokenCookie(
      { userId: user.id, code: codeGenerate } as JwtToken,
      config.cookie_access.user.accessExpireVerify,
    );

    res.cookie(
      config.cookie_access.user.nameVerify,
      tokenUser,
      validation_verify_cookie_setting,
    );

    await authCodeConfirmationMail({ email: user?.email, code: codeGenerate });

    return reply({ res, results: user });
  }

  /** Resend user code */
  @Get(`/resend-code`)
  @UseGuards(UserVerifyAuthStrategy)
  async resendCode(@Res() res, @Cookies() cookies) {
    const token = cookies[config.cookie_access.user.nameLogin];
    console.log(token);
    if (!token) {
      throw new HttpException(
        `Token not valid please change`,
        HttpStatus.NOT_FOUND,
      );
    }
    const codeGenerate = generateNumber(6);
    const payload = await this.checkUserService.verifyTokenCookie(token);
    const tokenUser = await this.checkUserService.createTokenCookie(
      { userId: payload?.userId, code: codeGenerate } as JwtToken,
      config.cookie_access.user.accessExpireVerify,
    );
    const findOneUser = await this.usersService.findOneBy({
      userId: payload?.userId,
    });
    if (!findOneUser)
      throw new HttpException(
        `User doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    res.cookie(
      config.cookie_access.user.nameVerify,
      tokenUser,
      validation_verify_cookie_setting,
    );

    await authCodeConfirmationMail({
      email: findOneUser?.email,
      code: codeGenerate,
    });

    return reply({ res, results: 'Code resend' });
  }

  /** Confirm email */
  @Post(`/confirm-email`)
  @UseGuards(UserVerifyAuthStrategy)
  async confirmEmail(
    @Res() res,
    @Body() body: ConfirmEmailUserDto,
    @Cookies() cookies,
  ) {
    const { code } = body;
    const token = cookies[config.cookie_access.user.nameVerify];
    if (!token)
      throw new HttpException(
        `Token not valid please change`,
        HttpStatus.NOT_FOUND,
      );

    const payload = await this.checkUserService.verifyTokenCookie(token);
    console.log(payload);
    if (payload?.code !== code) {
      throw new HttpException(
        `Code not valid please change`,
        HttpStatus.NOT_FOUND,
      );
    }
    await this.usersService.updateOne(
      { userId: payload?.userId },
      { confirmedAt: new Date() },
    );
    const tokenUser = await this.checkUserService.createTokenCookie(
      { userId: payload?.userId } as JwtToken,
      config.cookie_access.user.accessExpireLogin,
    );

    res.cookie(
      config.cookie_access.user.nameLogin,
      tokenUser,
      validation_login_cookie_setting,
    );

    return reply({ res, results: 'Email confirmed' });
  }

  /** Login user */
  @Post(`/login`)
  async createOneLogin(@Res() res, @Body() body: CreateLoginUserDto) {
    const { email, password } = body;

    const findOneUser = await this.usersService.findOneBy({
      email,
      provider: 'default',
    });
    if (!findOneUser)
      throw new HttpException(`Invalid credentials`, HttpStatus.NOT_FOUND);
    if (!(await checkIfPasswordMatch(findOneUser?.password, password)))
      throw new HttpException(`Invalid credentials`, HttpStatus.NOT_FOUND);

    const codeGenerate = generateNumber(6);

    // if (findOneUser?.confirmedAt === null)
    //   throw new HttpException(
    //     `Email: ${email} not confirmed please do`,
    //     HttpStatus.NOT_FOUND,
    //   );

    if (!findOneUser?.confirmedAt) {
      const tokenUserVerify = await this.checkUserService.createTokenCookie(
        { userId: findOneUser?.id, code: codeGenerate } as JwtToken,
        config.cookie_access.user.accessExpireVerify,
      );
      res.cookie(
        config.cookie_access.user.nameVerify,
        tokenUserVerify,
        validation_verify_cookie_setting,
      );

      await authCodeConfirmationMail({
        email: findOneUser.email,
        code: codeGenerate,
      });
    } else {
      const tokenUser = await this.checkUserService.createTokenCookie(
        { userId: findOneUser.id } as JwtToken,
        config.cookie_access.user.accessExpireLogin,
      );

      res.cookie(
        config.cookie_access.user.nameLogin,
        tokenUser,
        validation_login_cookie_setting,
      );
    }

    return reply({
      res,
      results: 'User logged in successfully',
    });
  }

  /** Reset password user */
  @Post(`/password/reset`)
  async resetPassword(@Res() res, @Body() body: ResetPasswordUserDto) {
    const { email } = body;

    const findOneUser = await this.usersService.findOneBy({
      email,
      provider: 'default',
    });
    if (!findOneUser)
      throw new HttpException(
        `User email ${email} invalid`,
        HttpStatus.NOT_FOUND,
      );

    const token = await this.checkUserService.createTokenCookie(
      { userId: findOneUser.id } as JwtToken,
      config.cookie_access.user.accessExpireVerify,
    );

    await authPasswordResetMail({
      email,
      token,
    });

    return reply({
      res,
      results: token,
    });
  }

  /** Password reset token */
  @Put(`/password/update/:token`)
  async updatePassword(@Res() res, @Body() body: UpdateResetPasswordUserDto) {
    const { password, token } = body;

    const payload = await this.checkUserService.verifyTokenCookie(token);
    const findOneUser = await this.usersService.findOneBy({
      userId: payload?.userId,
    });
    if (!findOneUser)
      throw new HttpException(`User  invalid`, HttpStatus.NOT_FOUND);
    await this.usersService.updateOne(
      { userId: findOneUser?.id },
      { password: await hashPassword(password) },
    );

    return reply({
      res,
      results: 'Password updated',
    });
  }

  /** IpLocation new user */
  @Get(`/ip-location`)
  async ipLocation(@Res() res, @Req() req) {
    const ip = await getOneLocationIpApi({
      ipLocation: getIpRequest(req) ?? '101.56.0.0',
    });
    const {
      continent,
      country,
      countryCode,
      continentCode,
      timezone,
      query,
      currency,
    } = ip;

    return reply({
      res,
      results: {
        continent,
        country,
        countryCode,
        timezone,
        query,
        continentCode,
        currency,
      },
    });
  }

  /** Logout user */
  @Get(`/logout`)
  async logout(@Res() res) {
    res.clearCookie(
      config.cookie_access.user.nameLogin,
      validation_login_cookie_setting,
    );

    return reply({ res, results: 'User logout successfully' });
  }
}
