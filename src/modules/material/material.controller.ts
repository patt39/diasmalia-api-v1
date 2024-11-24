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
import { reply } from '../../app/utils/reply';

import { FileInterceptor } from '@nestjs/platform-express';
import { DatabaseService } from 'src/app/database/database.service';
import { RequestPaginationDto } from '../../app/utils/pagination/request-pagination.dto';
import {
  addPagination,
  PaginationType,
} from '../../app/utils/pagination/with-pagination';
import { UploadsUtil } from '../integrations/integration.utils';
import { UserAuthGuard } from '../users/middleware';
import { CreateOrUpdateMaterialDto, GetMaterialQueryDto } from './material.dto';
import { MaterialService } from './material.service';

@Controller('materials')
export class MaterialController {
  constructor(
    private readonly materialsService: MaterialService,
    private readonly uploadsUtil: UploadsUtil,
    private readonly client: DatabaseService,
  ) {}

  /** Get all materials */
  @Get(`/`)
  @UseGuards(UserAuthGuard)
  async findAll(
    @Res() res,
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() queryMaterials: GetMaterialQueryDto,
  ) {
    const { type } = queryMaterials;

    const { take, page, sort, sortBy } = requestPaginationDto;
    const pagination: PaginationType = addPagination({
      page,
      take,
      sort,
      sortBy,
    });

    const material = await this.materialsService.findAll({
      type,
      pagination,
    });

    return reply({ res, results: material });
  }

  /** Post one material */
  @Post(`/create`)
  @UseGuards(UserAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateMaterialDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const { user } = req;
    const { name, type } = body;

    const { urlAWS } = await this.uploadsUtil.uploadOneAWS({
      file,
      userId: user?.id,
      folder: 'photos',
    });

    const material = await this.materialsService.createOne({
      type,
      name,
      image: urlAWS?.Location,
    });

    return reply({ res, results: material });
  }

  /** Update one material */
  @Put(`/:materialId/edit`)
  @UseGuards(UserAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateMaterialDto,
    @UploadedFile() file: Express.Multer.File,
    @Param('materialId', ParseUUIDPipe) materialId: string,
  ) {
    const { user } = req;
    const { name } = body;

    const { urlAWS } = await this.uploadsUtil.uploadOneAWS({
      file,
      userId: user?.id,
      folder: 'photos',
    });

    const findOneMaterial = await this.materialsService.findOneBy({
      materialId,
    });
    if (!findOneMaterial)
      throw new HttpException(
        `MaterialId: ${materialId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const material = await this.materialsService.updateOne(
      { materialId: findOneMaterial?.id },
      {
        name,
        image: urlAWS?.Location,
      },
    );

    return reply({ res, results: material });
  }

  /** Delete one material */
  @Delete(`/:materialId/delete`)
  @UseGuards(UserAuthGuard)
  async deleteOne(
    @Res() res,
    @Param('materialId', ParseUUIDPipe) materialId: string,
  ) {
    const findOneMaterial = await this.materialsService.findOneBy({
      materialId,
    });
    if (!findOneMaterial)
      throw new HttpException(
        `MaterialId: ${materialId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    await this.materialsService.updateOne(
      { materialId: findOneMaterial?.id },
      { deletedAt: new Date() },
    );

    return reply({ res, results: 'Material deleted successfully' });
  }
}
