import {
  Body,
  Controller,
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
import { CountriesService } from '../country/country.service';
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
    private readonly countriesService: CountriesService,
  ) {}

  /** Show Profile */
  @Get(`/:profileId/show`)
  @UseGuards(UserAuthGuard)
  async getOneByIdUser(
    @Res() res,
    @Param('profileId', ParseUUIDPipe) profileId: string,
  ) {
    const profile = await this.profilesService.findOneBy({ profileId });

    return reply({ res, results: profile });
  }

  /** Update user profile */
  @Put(`/:profileId/edit`)
  @UseGuards(UserAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async updateProfile(
    @Res() res,
    @Req() req,
    @Body() body: CreateOneContributorUserDto,
    @UploadedFile() file: Express.Multer.File,
    @Param('profileId', ParseUUIDPipe) profileId: string,
  ) {
    const { user } = req;

    const { urlAWS } = await this.uploadsUtil.uploadOneAWS({
      file,
      userId: user?.id,
      folder: 'photos',
    });

    const {
      city,
      phone,
      address,
      lastName,
      firstName,
      occupation,
      description,
      testimonial,
      countryId,
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

    const findCountry = await this.countriesService.findOneBy({
      countryId,
      status: true,
    });
    if (!findCountry)
      throw new HttpException(
        `CountryId: ${countryId} doesn't exists, please change`,
        HttpStatus.NOT_FOUND,
      );

    const fineOneUser = await this.profilesService.findOneBy({
      profileId,
    });
    if (!fineOneUser)
      throw new HttpException(
        `ProfileId: ${profileId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    await this.profilesService.updateOne(
      { profileId: user?.profile?.id },
      {
        city,
        phone,
        address,
        lastName,
        firstName,
        occupation,
        description,
        testimonial,
        userId: user?.id,
        photo: urlAWS?.Location,
        countryId: findCountry?.id,
        currencyId: findCurrency?.id,
      },
    );

    return reply({ res, results: 'Profile updated successfully' });
  }
}
