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
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { config } from '../../app/config/index';
import { reply } from '../../app/utils/reply';
import { UserAuthGuard } from './middleware';
import { UpdateOneEmailUserDto, UpdateUserPasswordDto } from './users.dto';
import { UsersService } from './users.service';
import { checkIfPasswordMatch, hashPassword } from './users.type';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /** Get one User */
  @Get(`/show/me`)
  @UseGuards(UserAuthGuard)
  async getOneByIdUser(@Res() res, @Req() req) {
    const { user } = req;
    const findOneUser = await this.usersService.findOneBy({
      userId: user?.id,
    });

    return reply({ res, results: findOneUser });
  }

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

  @Delete(`/:userId`)
  @UseGuards(UserAuthGuard)
  async deleteOnUser(
    @Res() res,
    @Req() req,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    const { user } = req;
    const findOneUser = await this.usersService.findOneBy({
      userId,
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
}
