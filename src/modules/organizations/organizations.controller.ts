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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RequestPaginationDto } from '../../app/utils/pagination/request-pagination.dto';
import {
  addPagination,
  PaginationType,
} from '../../app/utils/pagination/with-pagination';
import { reply } from '../../app/utils/reply';
import { SearchQueryDto } from '../../app/utils/search-query/search-query.dto';
import { getFileFromAws } from '../integrations/aws/aws-s3-service-adapter';
import { UploadsUtil } from '../integrations/integration.utils';
import { UserAuthGuard } from '../users/middleware';
import { UsersService } from '../users/users.service';
import {
  CreateOrUpdateOrganizationsDto,
  GetOneUploadsDto,
  GetOrganizationQueryDto,
} from './organizations.dto';
import { OrganizationsService } from './organizations.service';

@Controller('organization')
export class OrganizationsController {
  constructor(
    private readonly organizationsService: OrganizationsService,
    private readonly uploadsUtil: UploadsUtil,
    private readonly usersService: UsersService,
  ) {}

  /** Get all organizations */
  @Get(`/`)
  @UseGuards(UserAuthGuard)
  async findAll(
    @Res() res,
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() query: SearchQueryDto,
    @Query() queryOrganization: GetOrganizationQueryDto,
  ) {
    const { search } = query;
    const { userId } = queryOrganization;

    const { take, page, sort, sortBy } = requestPaginationDto;
    const pagination: PaginationType = addPagination({
      page,
      take,
      sort,
      sortBy,
    });

    const milkings = await this.organizationsService.findAll({
      search,
      userId,
      pagination,
    });

    return reply({ res, results: milkings });
  }

  /** Get one Organization */
  @Put(`/:organizationId/show`)
  @UseGuards(UserAuthGuard)
  async changeUserOrganization(
    @Res() res,
    @Req() req,
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
  ) {
    const { user } = req;
    const findOneOrganization = await this.organizationsService.findOneBy({
      organizationId,
    });
    if (!findOneOrganization)
      throw new HttpException(
        `OrganizationId: ${organizationId} doesn't exists, please change`,
        HttpStatus.NOT_FOUND,
      );

    const findUser = await this.usersService.updateOne(
      { userId: user?.id },
      { organizationId: findOneOrganization?.id },
    );

    return reply({ res, results: findUser });
  }

  /** Get one Organization */
  @Get(`/:organizationId/view`)
  @UseGuards(UserAuthGuard)
  async getUserOrganization(
    @Res() res,
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
  ) {
    const findOneOrganization = await this.organizationsService.findOneBy({
      organizationId,
    });
    if (!findOneOrganization)
      throw new HttpException(
        `OrganizationId: ${organizationId} doesn't exists, please change`,
        HttpStatus.NOT_FOUND,
      );

    const findUser = await this.usersService.findOneBy({
      organizationId: findOneOrganization?.id,
    });

    return reply({ res, results: findUser });
  }

  /** Update organization */
  @Put(`/update`)
  @UseGuards(UserAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async updateImage(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateOrganizationsDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const { user } = req;
    const { name, description } = body;

    const { fileName } = await this.uploadsUtil.uploadOneAWS({
      file,
      userId: user?.id,
      folder: 'images',
    });

    await this.organizationsService.updateOne(
      { organizationId: user.organizationId },
      {
        name,
        description,
        image: fileName,
      },
    );

    return reply({ res, results: 'Organization Updated Successfully' });
  }

  /** Update organization logo*/
  @Put(`/update/logo`)
  @UseGuards(UserAuthGuard)
  @UseInterceptors(FileInterceptor('logo'))
  async updateLogo(
    @Res() res,
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const { user } = req;

    const { urlAWS } = await this.uploadsUtil.uploadOneAWS({
      file,
      userId: user?.id,
      folder: 'logos',
    });

    await this.organizationsService.updateOne(
      { organizationId: user?.organizationId },
      { logo: urlAWS?.Location },
    );

    return reply({ res, results: 'Organization Updated Successfully' });
  }

  /** Get uploaded image */
  @Get(`/image/:folder/:name`)
  async getuploadedImage(@Res() res, @Param() params: GetOneUploadsDto) {
    const { name, folder } = params;
    try {
      const { fileBuffer, contentType } = await getFileFromAws({
        fileName: name,
        folder,
      });
      res.status(200);
      res.contentType(contentType);
      res.set('Cross-Origin-Resource-Policy', 'cross-origin');
      res.send(fileBuffer);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error during file recovering.');
    }
  }

  /** Get uploaded logo */
  @Get(`/logo/:folder/:name`)
  async getUploadedLogo(@Res() res, @Param() params: GetOneUploadsDto) {
    const { name, folder } = params;
    try {
      const { fileBuffer, contentType } = await getFileFromAws({
        fileName: name,
        folder,
      });
      res.status(200);
      res.contentType(contentType);
      res.set('Cross-Origin-Resource-Policy', 'cross-origin');
      res.send(fileBuffer);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error during file recovering.');
    }
  }

  /** Delete one Organization */
  @Delete(`/delete/:organizationId`)
  @UseGuards(UserAuthGuard)
  async deleteOne(
    @Res() res,
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
  ) {
    const findOrganization = await this.organizationsService.findOneBy({
      organizationId,
    });
    if (!findOrganization)
      throw new HttpException(
        `OrganizationId: ${organizationId} doesn't exists, please change`,
        HttpStatus.NOT_FOUND,
      );

    await this.organizationsService.updateOne(
      { organizationId: findOrganization.id },
      { deletedAt: new Date() },
    );

    return reply({ res, results: 'Organization Deleted Successfully' });
  }
}
