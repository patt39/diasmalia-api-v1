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
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { reply } from '../../app/utils/reply';

import { RequestPaginationDto } from '../../app/utils/pagination/request-pagination.dto';
import {
  addPagination,
  PaginationType,
} from '../../app/utils/pagination/with-pagination';
import { SearchQueryDto } from '../../app/utils/search-query/search-query.dto';
import { AnimalTypesService } from '../animal-type/animal-type.service';
import { UserAuthGuard } from '../users/middleware';
import {
  CreateOrUpdateAssignTypesDto,
  GetAssignTasksDto,
} from './assigne-type.dto';
import { AssignTypesService } from './assigne-type.service';

@Controller('assigned-type')
export class AssignTypesController {
  constructor(
    private readonly assignTypesService: AssignTypesService,
    private readonly animalTypesService: AnimalTypesService,
  ) {}

  /** Get all assignTypes */
  @Get(`/`)
  @UseGuards(UserAuthGuard)
  async findAll(
    @Res() res,
    @Req() req,
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() query: SearchQueryDto,
    @Query() queryAssigneTasks: GetAssignTasksDto,
  ) {
    const { user } = req;
    const { search } = query;
    const { animalTypeId, userId } = queryAssigneTasks;

    const { take, page, sort } = requestPaginationDto;
    const pagination: PaginationType = addPagination({ page, take, sort });

    const assignTypes = await this.assignTypesService.findAll({
      userId,
      search,
      pagination,
      animalTypeId,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: assignTypes });
  }

  /** Post one assignedType */
  @Post(`/`)
  @UseGuards(UserAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateAssignTypesDto,
  ) {
    const { user } = req;
    const { animalTypeId } = body;

    const findOneType = await this.animalTypesService.findOneBy({
      animalTypeId,
    });
    if (!findOneType)
      throw new HttpException(
        `AnimalTypeId: ${animalTypeId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneAnimalType = await this.assignTypesService.findOneBy({
      animalTypeId,
      status: false,
      organizationId: user?.organizationId,
    });

    const assignType = !findOneAnimalType
      ? await this.assignTypesService.createOne({
          userId: user.id,
          animalTypeId: findOneType.id,
          organizationId: user.organizationId,
          userCreatedId: user?.id,
        })
      : 'Already Created';

    return reply({
      res,
      results: {
        status: HttpStatus.CREATED,
        data: assignType,
        message: `Animal Type assigned successfully`,
      },
    });
  }

  /** View animal type */
  @Get(`/view/:assignTypeId`)
  @UseGuards(UserAuthGuard)
  async openAnimalType(
    @Res() res,
    @Req() req,
    @Param('assignTypeId', ParseUUIDPipe) assignTypeId: string,
  ) {
    const { user } = req;

    const findOneType = await this.assignTypesService.findOneBy({
      organizationId: user.organizationId,
    });
    if (findOneType.status === true) {
      throw new HttpException(
        `An animalType is already openned please close it before openning another one`,
        HttpStatus.FOUND,
      );
    }

    const findOneAssignType = await this.assignTypesService.findOneBy({
      assignTypeId,
      status: false,
      organizationId: user.organizationId,
    });
    if (!findOneAssignType)
      throw new HttpException(
        `AssigneTypeId: ${assignTypeId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    if (findOneAssignType.status === true)
      throw new HttpException(`Animal Type already openned`, HttpStatus.FOUND);

    await this.assignTypesService.updateOne(
      { assignTypeId: findOneAssignType.id },
      { status: true },
    );

    return reply({ res, results: 'Animal type opened' });
  }

  /** Close animal type */
  @Get(`/close/:assignTypeId`)
  @UseGuards(UserAuthGuard)
  async closeAnimalType(
    @Res() res,
    @Req() req,
    @Param('assignTypeId', ParseUUIDPipe) assignTypeId: string,
  ) {
    const { user } = req;
    const findOneAssignType = await this.assignTypesService.findOneBy({
      assignTypeId,
      status: true,
      organizationId: user.organizationId,
    });
    if (!findOneAssignType)
      throw new HttpException(
        `AnimalType: ${assignTypeId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    if (findOneAssignType.status === false)
      throw new HttpException(`Animal Type already closed`, HttpStatus.FOUND);

    await this.assignTypesService.updateOne(
      { assignTypeId: findOneAssignType.id },
      { status: false },
    );

    return reply({ res, results: 'Animal type closed' });
  }

  /** Delete one assignType */
  @Delete(`/delete/:assignTypeId`)
  @UseGuards(UserAuthGuard)
  async deleteOne(
    @Res() res,
    @Req() req,
    @Param('assignTypeId', ParseUUIDPipe) assignTypeId: string,
  ) {
    const { user } = req;
    const findOneAssignType = await this.assignTypesService.findOneBy({
      assignTypeId,
      organizationId: user?.organizationId,
    });
    if (!findOneAssignType) {
      throw new HttpException(
        `AssigneTaskId: ${assignTypeId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }
    const assignType = await this.assignTypesService.updateOne(
      { assignTypeId: findOneAssignType.id },
      { deletedAt: new Date() },
    );

    return reply({ res, results: assignType });
  }
}
