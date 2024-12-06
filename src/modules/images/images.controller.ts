import {
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { reply } from '../../app/utils/reply';

import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { RequestPaginationDto } from '../../app/utils/pagination/request-pagination.dto';
import {
  addPagination,
  PaginationType,
} from '../../app/utils/pagination/with-pagination';
import { UploadsUtil } from '../integrations/integration.utils';
import { GetImagesQueryDto } from '../organizations/organizations.dto';
import { OrganizationsService } from '../organizations/organizations.service';
import { UserAuthGuard } from '../users/middleware';
import { UsersService } from '../users/users.service';
import { ImagesService } from './images.service';

@Controller('images')
export class ImagesController {
  constructor(
    private readonly imagesService: ImagesService,
    private readonly uploadsUtil: UploadsUtil,
    private readonly usersService: UsersService,
    private readonly organizationService: OrganizationsService,
  ) {}

  /** Get all Images */
  @Get(`/`)
  async findAll(
    @Res() res,
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() imageQuery: GetImagesQueryDto,
  ) {
    const { take, page, sort, sortBy } = requestPaginationDto;
    const { userCreatedId } = imageQuery;
    const pagination: PaginationType = addPagination({
      page,
      take,
      sort,
      sortBy,
    });

    const images = await this.imagesService.findAll({
      pagination,
      userCreatedId,
    });

    return reply({ res, results: images });
  }

  /** Post images */
  @Post(`/create`)
  @UseInterceptors(AnyFilesInterceptor())
  @UseGuards(UserAuthGuard)
  async postImage(
    @Res() res,
    @Req() req,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    const { user } = req;

    await this.uploadsUtil.saveOrUpdateAws({
      files,
      userId: user?.id,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: 'Image saved successfully' });
  }

  /** Delete one Image */
  @Delete(`/:imageId/delete`)
  @UseGuards(UserAuthGuard)
  async deleteOne(
    @Res() res,
    @Req() req,
    @Param('imageId', ParseUUIDPipe) imageId: string,
  ) {
    const { user } = req;

    const findOneUser = await this.usersService.findOneBy({
      userId: user.id,
      organizationId: user?.organizationId,
    });

    const findOneImage = await this.imagesService.findOneBy({
      imageId,
      organizationId: findOneUser?.organizationId,
    });
    if (!findOneImage)
      throw new HttpException(
        `Image doesn't exists please update`,
        HttpStatus.NOT_FOUND,
      );

    await this.imagesService.updateOne(
      { imageId: findOneImage?.id },
      { deletedAt: new Date() },
    );

    return reply({ res, results: 'Image deleted successfully' });
  }
}
