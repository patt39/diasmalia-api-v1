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
import PdfPrinter from 'pdfmake';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { Readable, Writable } from 'stream';
import { config } from '../../app/config/index';
import { generateUUID } from '../../app/utils/commons';
import { RequestPaginationDto } from '../../app/utils/pagination/request-pagination.dto';
import {
  PaginationType,
  addPagination,
} from '../../app/utils/pagination/with-pagination';
import { reply } from '../../app/utils/reply';
import { SearchQueryDto } from '../../app/utils/search-query/search-query.dto';
import { AnimalsService } from '../animals/animals.service';
import { CurrenciesService } from '../currency/currency.service';
import { DeathsService } from '../death/deaths.service';
import {
  awsS3ServiceAdapter,
  getFileToAws,
} from '../integrations/aws/aws-s3-service-adapter';
import { emailPDFAttachment } from '../users/mails/email-pdf-attachment';
import { UserAuthGuard } from '../users/middleware';
import { UsersService } from '../users/users.service';
import { formateNowDateYYMMDD } from './../../app/utils/commons/formate-date';
import {
  BulkSalesDto,
  CreateOrUpdateSalesDto,
  GetOneUploadsDto,
  SaleMethodDto,
} from './sales.dto';
import { SalesService } from './sales.service';

@Controller('sales')
export class SalesController {
  constructor(
    private readonly salesService: SalesService,
    private readonly animalsService: AnimalsService,
    private readonly deathsService: DeathsService,
    private readonly usersService: UsersService,
    private readonly currenciesService: CurrenciesService,
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
    const { method, type } = querySaleMethod;

    const { take, page, sort } = requestPaginationDto;
    const pagination: PaginationType = addPagination({ page, take, sort });

    const sales = await this.salesService.findAll({
      type,
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
    if (findOneAnimal?.status === 'SOLD')
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
      { animalId: findOneAnimal?.id },
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
    const {
      date,
      email,
      note,
      type,
      price,
      method,
      soldTo,
      phone,
      animals,
      address,
    } = body;

    const getCurrency = await this.currenciesService.findOneBy({
      organizationId: user.organizationId,
    });

    const animalArrayPdf: any = [];

    // Split QR codes into rows
    const rows: any = [];

    for (const animal of animals) {
      const findOneAnimal = await this.animalsService.findOneBy({
        code: animal?.code,
      });
      if (findOneAnimal?.status === 'SOLD')
        throw new HttpException(
          `Animal ${findOneAnimal?.code} doesn't exists or already SOLD please change`,
          HttpStatus.NOT_FOUND,
        );

      animalArrayPdf.push({
        qr: `${config.datasite.url}/${config.api.prefix}/${config.api.version}/animals/view/${findOneAnimal?.id}`,
        fit: 80,
        margin: [0, 0, 0, 20],
        display: 'flex',
        alignment: 'center',
      });

      // Split QR codes into rows
      const rows: any = [];
      const batchSize = 4; // Number of QR codes per row
      for (let i = 0; i < animalArrayPdf.length; i += batchSize) {
        const row = animalArrayPdf.slice(i, i + batchSize);
        rows.push(row);
      }

      console.log('arrayRows====>', rows);

      const sale = await this.salesService.createOne({
        note,
        date,
        type,
        email,
        price,
        phone,
        method,
        soldTo,
        address,
        animalId: findOneAnimal?.id,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
      });

      if (findOneAnimal) {
        await this.animalsService.updateOne(
          { animalId: sale?.animalId },
          { status: 'SOLD' },
        );
      }
    }

    const fonts = {
      Helvetica: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique',
      },
    };

    const printer = new PdfPrinter(fonts);
    const docDefinition = {
      content: [
        {
          text: `${user?.organization?.logo}`,
          alignment: 'center',
          style: { fontSize: 10 },
          margin: [0, 10],
        },
        {
          text: `Bill for the sale/sales of ${type}`,
          alignment: 'center',
          bold: true,
          style: { fontSize: 20 },
          margin: [0, 0, 0, 20],
        },
        {
          text: `Agreement between ${user?.organization?.name}`,
          alignment: 'center',
          style: { fontSize: 13 },
          margin: [0, 0, 0, 20],
        },
        {
          text: `Located at: ${user?.profile?.address}`,
          style: { fontSize: 13 },
          margin: [0, 0, 0, 20],
        },
        {
          text: `Email: ${user?.email},  Phone:  ${user?.profile?.phone}`,
          style: { fontSize: 13 },
          margin: [0, 0, 0, 20],
        },
        {
          text: `- AND -`,
          alignment: 'center',
          bold: true,
          style: { fontSize: 15 },
          margin: [0, 0, 0, 20],
        },
        {
          text: `Buyer name: ${soldTo}`,
          style: { fontSize: 13 },
          margin: [0, 0, 0, 20],
        },
        {
          text: `Adresse: ${address}`,
          style: { fontSize: 13 },
          margin: [0, 0, 0, 20],
        },
        {
          text: `Email: ${email},  Phone:  ${phone}`,
          style: { fontSize: 13 },
          margin: [0, 0, 0, 20],
        },
        {
          text: `Below are the QRCodes of your animals you can have access to them through our organization by simply scanning them anytime`,
          style: { fontSize: 12 },
          margin: [0, 0, 0, 20],
        },
        { columns: rows },
        {
          text: `Sold in ${method}, Price:  ${price} ${getCurrency.symbol}`,
          style: { fontSize: 12 },
          bold: true,
          margin: [0, 0, 0, 20],
        },
        {
          text: `It's been a pleasure working with you. Please don't hesitate to call or email us if you have any issues thanks`,
          style: { fontSize: 11 },
          margin: [0, 0, 0, 20],
        },
        '\n',
        {
          text: `${new Date()}`,
          style: { fontSize: 10 },
          margin: [0, 0, 0, 20],
        },
      ],
      styles: {
        policyText: {
          //fontSize: 20,
          // bold: true,
        },
      },
      defaultStyle: {
        //columnGap: 30,
        //bold: true,
        font: 'Helvetica',
      },
    } as TDocumentDefinitions;

    const nameFile = `${formateNowDateYYMMDD(new Date())}-${generateUUID()}`;
    const fileName = `${nameFile}.pdf`;
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    pdfDoc.compress = true;
    const chunks = [] as any;
    await new Promise((resolve, reject) => {
      const stream = new Writable({
        write: (chunk, _, next) => {
          chunks.push(chunk);
          next();
        },
      });
      stream.once('error', (err) => reject(err));
      stream.once('close', () => resolve('ok'));

      pdfDoc.pipe(stream);
      pdfDoc.end();
    });

    await awsS3ServiceAdapter({
      fileName: fileName,
      mimeType: 'application/pdf',
      folder: 'sales-pdf',
      file: Buffer.concat(chunks),
    });

    const findOneUser = await this.usersService.findOneBy({ email });
    if (findOneUser) {
      await emailPDFAttachment({
        user,
        email: findOneUser?.email,
        filename: fileName,
        content: Buffer.concat(chunks),
      });
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
