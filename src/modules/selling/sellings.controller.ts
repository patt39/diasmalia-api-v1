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
  UseGuards,
} from '@nestjs/common';
import { RequestPaginationDto } from '../../app/utils/pagination/request-pagination.dto';
import {
  PaginationType,
  addPagination,
} from '../../app/utils/pagination/with-pagination';
import { reply } from '../../app/utils/reply';
import { SearchQueryDto } from '../../app/utils/search-query/search-query.dto';
import { AnimalsService } from '../animals/animals.service';
import { UserAuthGuard } from '../users/middleware';
import {
  BulkSalesDto,
  CreateOrUpdateSellingsDto,
  SaleMethodDto,
} from './sellings.dto';
import { SellingsService } from './sellings.service';

@Controller('sellings')
export class SellingsController {
  constructor(
    private readonly sellingsService: SellingsService,
    private readonly animalsService: AnimalsService,
  ) {}

  /** Get all Selling */
  @Get(`/`)
  @UseGuards(UserAuthGuard)
  async findAll(
    @Res() res,
    @Req() req,
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() query: SearchQueryDto,
    @Query() querySaleMethod: SaleMethodDto,
  ) {
    const { user } = req;
    const { search } = query;
    const { method } = querySaleMethod;

    const { take, page, sort } = requestPaginationDto;
    const pagination: PaginationType = addPagination({ page, take, sort });

    const sellings = await this.sellingsService.findAll({
      method,
      search,
      pagination,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: sellings });
  }

  /** Post one Selling */
  @Post(`/create`)
  @UseGuards(UserAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateSellingsDto,
  ) {
    const { user } = req;
    const { note, price, date, code, method, soldTo, phone } = body;

    const findOneAnimal = await this.animalsService.findOneBy({
      code,
      isIsolated: 'FALSE',
    });
    if (!findOneAnimal) {
      throw new HttpException(
        `Animal ${findOneAnimal?.code} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }
    const selling = await this.sellingsService.createOne({
      note,
      date,
      phone,
      price,
      soldTo,
      method,
      animalId: findOneAnimal?.id,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    return reply({ res, results: selling });
  }

  /** Update one Selling */
  @Put(`/:sellingId/edit`)
  @UseGuards(UserAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateSellingsDto,
    @Param('sellingId', ParseUUIDPipe) sellingId: string,
  ) {
    const { user } = req;
    const { note, price, date, code, method, soldTo, phone } = body;

    const findOneAnimal = await this.animalsService.findOneBy({
      code,
      isIsolated: 'FALSE',
      organizationId: user?.organizationId,
    });
    if (!findOneAnimal) {
      throw new HttpException(
        `Animal ${findOneAnimal?.code} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    const selling = await this.sellingsService.updateOne(
      { sellingId },
      {
        note,
        date,
        price,
        phone,
        method,
        soldTo,
        animalId: findOneAnimal?.id,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
      },
    );

    return reply({ res, results: selling });
  }

  /** Post one Bulk sale */
  @Post(`/bulk/create`)
  @UseGuards(UserAuthGuard)
  async createOneBulk(@Res() res, @Req() req, @Body() body: BulkSalesDto) {
    const { user } = req;
    const { date, animals, note, price, method, soldTo, phone } = body;

    for (const animal of animals) {
      const findOneAnimal = await this.animalsService.findOneBy({
        status: 'ACTIVE',
        code: animal?.code,
        isIsolated: 'FALSE',
      });
      if (!findOneAnimal) {
        throw new HttpException(
          `Animal ${findOneAnimal?.code} doesn't exists please change`,
          HttpStatus.NOT_FOUND,
        );
      }

      const sell = await this.sellingsService.createOne({
        note,
        date,
        price,
        phone,
        method,
        soldTo,
        animalId: findOneAnimal?.id,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
      });

      await this.animalsService.updateOne(
        { animalId: sell?.animalId },
        { status: 'SOLD' },
      );
    }

    return reply({ res, results: 'Saved' });
  }

  /** Get one Selling */
  @Get(`/view/:sellingId`)
  @UseGuards(UserAuthGuard)
  async getOneByIdUser(
    @Res() res,
    @Req() req,
    @Param('sellingId', ParseUUIDPipe) sellingId: string,
  ) {
    const { user } = req;
    const findOneSelling = await this.sellingsService.findOneBy({
      sellingId,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: findOneSelling });
  }

  /** Delete one Selling */
  @Delete(`/delete/:sellingId`)
  @UseGuards(UserAuthGuard)
  async deleteOne(
    @Res() res,
    @Req() req,
    @Param('sellingId', ParseUUIDPipe) sellingId: string,
  ) {
    const { user } = req;
    const findOneSelling = await this.sellingsService.findOneBy({
      sellingId,
      organizationId: user?.organizationId,
    });
    const selling = await this.sellingsService.updateOne(
      { sellingId: findOneSelling?.id },
      { deletedAt: new Date() },
    );

    return reply({ res, results: selling });
  }
}
