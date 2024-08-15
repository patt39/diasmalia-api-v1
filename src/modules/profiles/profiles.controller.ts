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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { reply } from '../../app/utils/reply';

import { FileInterceptor } from '@nestjs/platform-express';
import { CreateOneContributorUserDto } from '../contributors/contributors.dto';
import { CurrenciesService } from '../currency/currency.service';
import { UploadsUtil } from '../integrations/integration.utils';
import { UserAuthGuard } from '../users/middleware';
import { ProfilesService } from './profiles.service';

@Controller('profiles')
export class ProfilesController {
  constructor(
    private readonly profilesService: ProfilesService,
    private readonly uploadsUtil: UploadsUtil,
    private readonly currenciesService: CurrenciesService,
  ) {}

  /** Show Profile */
  @Get(`/show/:profileId`)
  @UseGuards(UserAuthGuard)
  async getOneByIdUser(
    @Res() res,
    @Param('profileId', ParseUUIDPipe) profileId: string,
  ) {
    const profile = await this.profilesService.findOneBy({ profileId });

    return reply({ res, results: profile });
  }

  /** Update user profile */
  @Put(`/user/update/`)
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
      userId: user.id,
      folder: 'photos',
    });

    const {
      city,
      phone,
      address,
      lastName,
      firstName,
      occupation,
      companyName,
      description,
      currencyId,
    } = body;

    const findCurrency = await this.currenciesService.findOneBy({
      currencyId,
      status: true,
    });
    if (!findCurrency)
      throw new HttpException(
        `CurrencyId: ${currencyId} doesn't exists, please change`,
        HttpStatus.NOT_FOUND,
      );

    await this.profilesService.updateOne(
      { profileId: user.profile?.id },
      {
        city,
        phone,
        address,
        lastName,
        firstName,
        occupation,
        companyName,
        description,
        photo: fileName,
        userId: user.id,
        currencyId: findCurrency.id,
      },
    );

    return reply({ res, results: 'Profile updated successfully' });
  }

  /** Delete one Profiles */
  @Delete(`/delete/:profileId`)
  @UseGuards(UserAuthGuard)
  async deleteOne(
    @Res() res,
    @Param('profileId', ParseUUIDPipe) profileId: string,
  ) {
    const profile = await this.profilesService.updateOne(
      { profileId },
      { deletedAt: new Date() },
    );

    return reply({ res, results: profile });
  }
}
