import {
  Controller,
  Res,
  Body,
  HttpStatus,
  HttpException,
  Post,
} from '@nestjs/common';
import { reply } from '../../app/utils/reply';

import { UsersService } from './users.service';
import { CreateLoginUserDto, RegisterUserDto } from './users.dto';
import { ProfilesService } from '../profiles/profiles.service';
import { OrganizationsService } from '../organizations/organizations.service';
import { ContributorsService } from '../contributors/contributors.service';
import {
  JwtPayloadType,
  checkIfPasswordMatch,
  hashPassword,
} from './users.type';
import { CheckUserService } from './middleware/check-user.service';

@Controller()
export class UsersAuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly profilesService: ProfilesService,
    private readonly checkUserService: CheckUserService,
    private readonly contributorsService: ContributorsService,
    private readonly organizationsService: OrganizationsService,
  ) {}

  /** Post one Users */
  @Post(`/register`)
  // @UseGuards(JwtAuthGuard)
  async createOne(@Res() res, @Body() body: RegisterUserDto) {
    const { email, password, firstName, lastName, nameOrganization } = body;

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
      userId: user.id,
    });

    const organization = await this.organizationsService.createOne({
      name: nameOrganization,
      userId: user.id,
    });

    await this.usersService.updateOne(
      { userId: user.id },
      { organizationId: organization.id },
    );

    await this.contributorsService.createOne({
      role: 'SUPERADMIN',
      userId: user.id,
      organizationId: organization.id,
      userCreatedId: user.id,
    });

    return reply({ res, results: user });
  }

  /** Login user */
  @Post(`/login`)
  async createOneLogin(@Res() res, @Body() body: CreateLoginUserDto) {
    const { email, password } = body;

    const findOnUser = await this.usersService.findOneBy({
      email,
      provider: 'default',
    });
    if (!(await checkIfPasswordMatch(findOnUser?.password, password)))
      throw new HttpException(`Invalid credentials`, HttpStatus.NOT_FOUND);

    const jwtPayload: JwtPayloadType = {
      id: findOnUser.id,
      organizationId: findOnUser.organizationId,
    };

    const refreshToken =
      await this.checkUserService.createJwtTokens(jwtPayload);

    return reply({
      res,
      results: {
        id: findOnUser.id,
        accessToken: `Bearer ${refreshToken}`,
        organizationId: findOnUser.organizationId,
      },
    });
  }
}
