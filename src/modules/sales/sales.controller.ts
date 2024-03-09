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
import { DeathsService } from '../death/deaths.service';
import { UserAuthGuard } from '../users/middleware';
import {
  BulkSalesDto,
  CreateOrUpdateSalesDto,
  SaleMethodDto,
} from './sales.dto';
import { SalesService } from './sales.service';

@Controller('sales')
export class SalesController {
  constructor(
    private readonly salesService: SalesService,
    private readonly animalsService: AnimalsService,
    private readonly deathsService: DeathsService,
  ) {}

  /** Get all Sales */
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

    const sales = await this.salesService.findAll({
      method,
      search,
      pagination,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: sales });
  }

  /** Post one Sales */
  @Post(`/create`)
  @UseGuards(UserAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateSalesDto,
  ) {
    const { user } = req;
    const { note, price, date, code, method, soldTo, phone } = body;

    const findOneAnimal = await this.animalsService.findOneBy({
      code,
    });
    if (findOneAnimal.status === 'SOLD')
      throw new HttpException(
        `Animal ${findOneAnimal?.code} doesn't exists or it's already SOLD please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneSale = await this.salesService.findOneBy({
      organizationId: user?.organizationId,
    });
    if (findOneSale)
      throw new HttpException(`Animal already sold`, HttpStatus.NOT_FOUND);

    const sale = await this.salesService.createOne({
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

    await this.animalsService.updateOne(
      { animalId: sale?.animalId },
      { status: 'SOLD' },
    );

    return reply({ res, results: sale });
  }

  /** Update one Sale */
  @Put(`/:saleId/edit`)
  @UseGuards(UserAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateSalesDto,
    @Param('saleId', ParseUUIDPipe) saleId: string,
  ) {
    const { user } = req;
    const { note, status, price, date, code, method, soldTo, phone } = body;

    const findOneSale = await this.salesService.findOneBy({
      saleId,
    });
    if (!findOneSale)
      throw new HttpException(
        `SaleId: ${saleId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneAnimal = await this.animalsService.findOneBy({
      code,
    });
    if (!findOneAnimal)
      throw new HttpException(
        `Animal ${findOneAnimal?.code} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    if (status === 'SOLD') {
      await this.salesService.updateOne(
        { saleId },
        {
          note,
          date,
          price,
          phone,
          status,
          method,
          soldTo,
          animalId: findOneAnimal?.id,
          organizationId: user?.organizationId,
          userCreatedId: user?.id,
        },
      );

      await this.animalsService.updateOne(
        { animalId: findOneAnimal?.id },
        { status: status },
      );
    }

    if (status === 'ACTIVE') {
      await this.animalsService.updateOne(
        { animalId: findOneAnimal?.id },
        { status: status },
      );

      await this.salesService.updateOne(
        { saleId: findOneSale?.id },
        { deletedAt: new Date(), status: 'SOLD' },
      );
    }

    if (status === 'DEAD') {
      await this.deathsService.createOne({
        animalId: findOneAnimal?.id,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
        status: 'DEAD',
      });

      await this.animalsService.updateOne(
        { animalId: findOneAnimal?.id },
        { status: status },
      );

      await this.salesService.updateOne(
        { saleId: findOneSale?.id },
        { deletedAt: new Date(), status: 'SOLD' },
      );
    }

    return reply({ res, results: 'Sale Updated Successfully' });
  }

  /** Post one Bulk sale */
  @Post(`/bulk/create`)
  @UseGuards(UserAuthGuard)
  async createOneBulk(@Res() res, @Req() req, @Body() body: BulkSalesDto) {
    const { user } = req;
    const { date, animals, note, price, method, soldTo, phone } = body;

    for (const animal of animals) {
      const findOneAnimal = await this.animalsService.findOneBy({
        code: animal?.code,
      });
      if (findOneAnimal.status === 'SOLD')
        throw new HttpException(
          `Animal ${findOneAnimal?.code} doesn't exists or animal already SOLD please change`,
          HttpStatus.NOT_FOUND,
        );

      const sale = await this.salesService.createOne({
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
        { animalId: sale?.animalId },
        { status: 'SOLD' },
      );
    }

    return reply({ res, results: 'Saved' });
  }

  /** Get one Sale */
  @Get(`/view/:saleId`)
  @UseGuards(UserAuthGuard)
  async getOneByIdUser(
    @Res() res,
    @Req() req,
    @Param('saleId', ParseUUIDPipe) saleId: string,
  ) {
    const { user } = req;
    const findOneSale = await this.salesService.findOneBy({
      saleId,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: findOneSale });
  }

  /** Download sales */
  @Get(`/export`)
  @UseGuards(UserAuthGuard)
  async getDownloadSales(@Res() res) {
    try {
      await this.salesService.downloadToExcel(res);
      res.setHeader(
        'Content-Disposition',
        'attachment; filename= ' + 'SalesExport.xlsx',
      );

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocuments.spreadsheetml.sheet',
      );
    } catch (error) {
      console.error(error);
      res.status(500).send('Error during download.');
    }
  }

  /** Delete one Sale */
  @Delete(`/delete/:saleId`)
  @UseGuards(UserAuthGuard)
  async deleteOne(
    @Res() res,
    @Req() req,
    @Param('saleId', ParseUUIDPipe) saleId: string,
  ) {
    const { user } = req;
    const findOneSale = await this.salesService.findOneBy({
      saleId,
      organizationId: user?.organizationId,
    });
    const sale = await this.salesService.updateOne(
      { saleId: findOneSale?.id },
      { deletedAt: new Date() },
    );

    return reply({ res, results: sale });
  }
}
