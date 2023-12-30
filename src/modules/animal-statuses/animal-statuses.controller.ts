import {
  Controller,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  Delete,
  Res,
  Req,
  Get,
  Query,
  UseGuards,
  Put,
} from '@nestjs/common';
import { reply } from '../../app/utils/reply';

import { AnimalStatusesService } from './animal-statuses.service';
import { CreateOrUpdateAnimalStatusesDto } from './animal-statuses.dto';
import { JwtAuthGuard } from '../users/middleware';

@Controller('animal-statuses')
export class AnimalStatusesController {
  constructor(private readonly animalStatusesService: AnimalStatusesService) {}

  @Get(`/`)
  @UseGuards(JwtAuthGuard)
  async findAll(@Res() res) {
    const animalStatus = await this.animalStatusesService.findAll();

    return reply({ res, results: animalStatus });
  }

  /** Post one Animal status */
  @Post(`/`)
  @UseGuards(JwtAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateAnimalStatusesDto,
  ) {
    const { title, color } = body;
    const animalStatus = await this.animalStatusesService.createOne({
      title,
      color,
    });

    return reply({ res, results: animalStatus });
  }

  /** Update one animal status */
  @Put(`/:animalStatusId`)
  @UseGuards(JwtAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateAnimalStatusesDto,
    @Param('animalStatusId', ParseUUIDPipe) animalStatusId: string,
  ) {
    const { title, color } = body;

    const animalStatus = await this.animalStatusesService.updateOne(
      { animalStatusId },
      {
        title,
        color,
      },
    );

    return reply({ res, results: animalStatus });
  }

  /** Get one animal status */
  @Get(`/view`)
  @UseGuards(JwtAuthGuard)
  async getOneByIdUser(
    @Res() res,
    @Query('animalStatusId', ParseUUIDPipe) animalStatusId: string,
  ) {
    const animalStatus = await this.animalStatusesService.findOneBy({
      animalStatusId,
    });

    return reply({ res, results: animalStatus });
  }

  /** Delete animal status*/
  @Delete(`/delete/:animalStatusId`)
  @UseGuards(JwtAuthGuard)
  async deleteOne(
    @Res() res,
    @Param('animalStatusId', ParseUUIDPipe) animalStatusId: string,
  ) {
    const animalStatus = await this.animalStatusesService.updateOne(
      { animalStatusId },
      { deletedAt: new Date() },
    );

    return reply({ res, results: animalStatus });
  }
}
