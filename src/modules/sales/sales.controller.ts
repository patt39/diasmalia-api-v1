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
import { Readable } from 'stream';
import { RequestPaginationDto } from '../../app/utils/pagination/request-pagination.dto';
import {
  PaginationType,
  addPagination,
} from '../../app/utils/pagination/with-pagination';
import { reply } from '../../app/utils/reply';
import { SearchQueryDto } from '../../app/utils/search-query/search-query.dto';
import { BatchsService } from '../batchs/batchs.service';
import { getFileToAws } from '../integrations/aws/aws-s3-service-adapter';
import { UserAuthGuard } from '../users/middleware';
import {
  CreateOrUpdateSalesDto,
  GetOneUploadsDto,
  SaleMethodDto,
} from './sales.dto';
import { SalesService } from './sales.service';

@Controller('sales')
export class SalesController {
  constructor(
    private readonly salesService: SalesService,
    private readonly batchsService: BatchsService,
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
    const { note, price, date, quantity, batchId, method, soldTo, phone } =
      body;

    const findOneBatch = await this.batchsService.findOneBy({
      batchId,
    });
    if (findOneBatch)
      throw new HttpException(
        `BatchId: ${batchId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const sale = await this.salesService.createOne({
      note,
      date,
      phone,
      price,
      soldTo,
      method,
      quantity,
      batchId: findOneBatch?.id,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

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
    const { note, price, date, quantity, batchId, method, soldTo, phone } =
      body;

    const findOneSale = await this.salesService.findOneBy({
      saleId,
    });
    if (!findOneSale)
      throw new HttpException(
        `SaleId: ${saleId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneBatch = await this.batchsService.findOneBy({
      batchId,
    });
    if (!findOneBatch)
      throw new HttpException(
        `BatchId: ${batchId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    await this.salesService.updateOne(
      { saleId },
      {
        note,
        date,
        price,
        phone,
        method,
        soldTo,
        quantity,
        batchId: findOneBatch?.id,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
      },
    );

    return reply({ res, results: 'Sale Updated Successfully' });
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
    if (!findOneSale)
      throw new HttpException(
        `SaleId: ${saleId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

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

  /** Get uploaded file */
  @Get(`/:folder/:name/download`)
  async getOneUploadedPDF(@Res() res, @Param() params: GetOneUploadsDto) {
    const { name, folder } = params;
    try {
      const { fileBuffer, contentType } = await getFileToAws({
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

  /** Download sale */
  @Get(`/download/:folder/:name`)
  async downloadSale(@Res() res, @Param() params: GetOneUploadsDto) {
    const { name, folder } = params;
    try {
      const { fileBuffer, contentType } = await getFileToAws({
        folder,
        fileName: name,
      });
      const readStream = Readable.from([fileBuffer]);

      res.status(200);
      res.setHeader('Content-Disposition', `attachment; filename="${name}"`);
      res.contentType(contentType);
      res.set('Cross-Origin-Resource-Policy', 'cross-origin');
      readStream.pipe(res);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error during file recovering.');
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
