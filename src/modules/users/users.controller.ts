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
import { UserAuthGuard } from './middleware';
import { UpdateOneEmailUserDto, UpdateUserPasswordDto } from './users.dto';
import { UsersService } from './users.service';
import { checkIfPasswordMatch, hashPassword } from './users.type';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /** Get one User */
  @Get(`/me`)
  @UseGuards(UserAuthGuard)
  async getMe(@Res() res, @Req() req) {
    const { user } = req;
    const findOneUser = await this.usersService.findMe({
      userId: user.id,
    });
    if (!findOneUser)
      throw new HttpException(`Invalid credentials`, HttpStatus.NOT_FOUND);

    return reply({
      res,
      results: { ...findOneUser, role: user?.contributor?.role },
    });
  }

  /** Get all users */
  @Get(`/`)
  @UseGuards(UserAuthGuard)
  async findAll(
    @Res() res,
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() query: SearchQueryDto,
  ) {
    const { search } = query;

    const { take, page, sort } = requestPaginationDto;
    const pagination: PaginationType = addPagination({ page, take, sort });

    const users = await this.usersService.findAll({
      search,
      pagination,
    });

    return reply({ res, results: users });
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

  /** Delete user */
  @Delete(`/:userId`)
  @UseGuards(UserAuthGuard)
  async deleteOneUser(
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
