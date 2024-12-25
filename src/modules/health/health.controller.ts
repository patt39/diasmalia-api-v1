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
import { FileInterceptor } from '@nestjs/platform-express';
import { RequestPaginationDto } from '../../app/utils/pagination/request-pagination.dto';
import {
  addPagination,
  PaginationType,
} from '../../app/utils/pagination/with-pagination';
import { reply } from '../../app/utils/reply';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { UploadsUtil } from '../integrations/integration.utils';
import { UserAuthGuard } from '../users/middleware';
import { CreateOrUpdateHealthsDto, GetHealthQueryDto } from './health.dto';
import { HealthsService } from './health.service';

@Controller('health')
export class HealthsController {
  constructor(
    private readonly uploadsUtil: UploadsUtil,
    private readonly healthsService: HealthsService,
    private readonly activitylogsService: ActivityLogsService,
  ) {}

  /** Get health */
  @Get(`/`)
  @UseGuards(UserAuthGuard)
  async findAll(
    @Res() res,
    @Req() req,
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() queryFeeding: GetHealthQueryDto,
  ) {
    const { user } = req;
    const { status } = queryFeeding;

    const { take, page, sort, sortBy } = requestPaginationDto;
    const pagination: PaginationType = addPagination({
      page,
      take,
      sort,
      sortBy,
    });

    const health = await this.healthsService.findAll({
      status,
      pagination,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: health });
  }

  /** Post one health */
  @Post(`/create`)
  @UseInterceptors(FileInterceptor('image'))
  @UseGuards(UserAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateOrUpdateHealthsDto,
  ) {
    const { user } = req;
    const { name, description } = body;

    const findOneHealth = await this.healthsService.findOneBy({
      name,
      organizationId: user?.organizationId,
    });
    if (findOneHealth)
      throw new HttpException(
        `Health ${name} already created please update`,
        HttpStatus.NOT_FOUND,
      );

    const { urlAWS } = await this.uploadsUtil.uploadOneAWS({
      file,
      userId: user?.id,
      folder: 'photos',
    });

    const health = await this.healthsService.createOne({
      name,
      description,
      image: urlAWS?.Location,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    await this.activitylogsService.createOne({
      userId: user?.id,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} added ${name} in health box `,
      organizationId: user?.organizationId,
    });

    return reply({
      res,
      results: {
        status: HttpStatus.CREATED,
        data: health,
        message: `Health Created Successfully`,
      },
    });
  }

  /** Change status */
  @Put(`/:healthId/change-status`)
  @UseGuards(UserAuthGuard)
  async changeStatus(
    @Res() res,
    @Req() req,
    @Param('healthId', ParseUUIDPipe) healthId: string,
  ) {
    const { user } = req;

    const findOneHealth = await this.healthsService.findOneBy({
      healthId,
      organizationId: user?.organizationId,
    });
    if (!findOneHealth)
      throw new HttpException(
        `Name: ${findOneHealth?.name} doesn't exists please update`,
        HttpStatus.NOT_FOUND,
      );

    await this.healthsService.updateOne(
      { healthId: findOneHealth?.id },
      { status: !findOneHealth?.status },
    );

    return reply({ res, results: 'Status changed successfully' });
  }

  /** Update one health */
  @Put(`/:healthId/edit`)
  @UseInterceptors(FileInterceptor('image'))
  @UseGuards(UserAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateHealthsDto,
    @UploadedFile() file: Express.Multer.File,
    @Param('healthId', ParseUUIDPipe) healthId: string,
  ) {
    const { user } = req;
    const { description, name } = body;

    const findOneHealth = await this.healthsService.findOneBy({
      healthId,
      organizationId: user?.organizationId,
    });
    if (!findOneHealth)
      throw new HttpException(
        `Name: ${findOneHealth?.name} doesn't exists please update`,
        HttpStatus.NOT_FOUND,
      );

    const { urlAWS } = await this.uploadsUtil.uploadOneAWS({
      file,
      userId: user?.id,
      folder: 'photos',
    });

    const gestation = await this.healthsService.updateOne(
      { healthId: findOneHealth?.id },
      {
        name,
        description,
        image: urlAWS?.Location,
      },
    );

    await this.activitylogsService.createOne({
      userId: user?.id,
      organizationId: user?.organizationId,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} updated medication`,
    });

    return reply({
      res,
      results: {
        status: HttpStatus.CREATED,
        data: gestation,
        message: 'Health updated successfully',
      },
    });
  }

  /** Get one health */
  @Get(`/:healthId/view`)
  @UseGuards(UserAuthGuard)
  async getOneByIdGestation(
    @Res() res,
    @Req() req,
    @Param('healthId', ParseUUIDPipe) healthId: string,
  ) {
    const { user } = req;

    const findOneHealth = await this.healthsService.findOneBy({
      healthId,
      organizationId: user?.organizationId,
    });
    if (!findOneHealth)
      throw new HttpException(
        `Name: ${findOneHealth?.name} doesn't exists please update`,
        HttpStatus.NOT_FOUND,
      );

    return reply({ res, results: findOneHealth });
  }

  /** Delete one health */
  @Delete(`/:healthId/delete`)
  @UseGuards(UserAuthGuard)
  async deleteOne(
    @Res() res,
    @Req() req,
    @Param('healthId', ParseUUIDPipe) healthId: string,
  ) {
    const { user } = req;

    const findOneHealth = await this.healthsService.findOneBy({
      healthId,
      organizationId: user?.organizationId,
    });
    if (!findOneHealth)
      throw new HttpException(
        `Name: ${findOneHealth?.name} doesn't exists please update`,
        HttpStatus.NOT_FOUND,
      );

    await this.healthsService.updateOne(
      { healthId: findOneHealth?.id },
      { deletedAt: new Date() },
    );

    await this.activitylogsService.createOne({
      userId: user?.id,
      organizationId: user?.organizationId,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} deleted a medication`,
    });

    return reply({ res, results: 'Medication deleted successfully' });
  }
}
