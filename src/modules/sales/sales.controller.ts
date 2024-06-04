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
import { Writable } from 'stream';
import { config } from '../../app/config/index';
import { generateUUID } from '../../app/utils/commons';
import { RequestPaginationDto } from '../../app/utils/pagination/request-pagination.dto';
import {
  PaginationType,
  addPagination,
} from '../../app/utils/pagination/with-pagination';
import { reply } from '../../app/utils/reply';
import { SearchQueryDto } from '../../app/utils/search-query/search-query.dto';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { AnimalsService } from '../animals/animals.service';
import { AssignTypesService } from '../assigne-type/assigne-type.service';
import {
  awsS3ServiceAdapter,
  getFileFromAws,
} from '../integrations/aws/aws-s3-service-adapter';
import { emailPDFAttachment } from '../users/mails/email-pdf-attachment';
import { UserAuthGuard } from '../users/middleware';
import { UsersService } from '../users/users.service';
import {
  formatDDMMYYDate,
  formatNowDateYYMMDD,
} from './../../app/utils/commons/formate-date';
import {
  BulkSalesDto,
  CreateOrUpdateSalesDto,
  GetOneUploadsDto,
  SalesDto,
} from './sales.dto';
import { SalesService } from './sales.service';

@Controller('sales')
export class SalesController {
  constructor(
    private readonly salesService: SalesService,
    private readonly animalsService: AnimalsService,
    private readonly assignTypesService: AssignTypesService,
    private readonly usersService: UsersService,
    private readonly activitylogsService: ActivityLogsService,
  ) {}

  /** Get all Sales */
  @Get(`/`)
  @UseGuards(UserAuthGuard)
  async findAll(
    @Res() res,
    @Req() req,
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() query: SearchQueryDto,
    @Query() querySaleMethod: SalesDto,
  ) {
    const { user } = req;
    const { search } = query;
    const { method, type } = querySaleMethod;

    const { take, page, sort, sortBy } = requestPaginationDto;
    const pagination: PaginationType = addPagination({
      page,
      take,
      sort,
      sortBy,
    });

    const sales = await this.salesService.findAll({
      type,
      method,
      search,
      pagination,
      organizationId: user.organizationId,
    });

    return reply({ res, results: sales });
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
    const { note, status, price, animalCode, method, soldTo, phone } = body;

    const findOneSale = await this.salesService.findOneBy({
      saleId,
      organizationId: user.organizationId,
    });
    if (!findOneSale)
      throw new HttpException(
        `SaleId: ${saleId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneAnimal = await this.animalsService.findOneBy({
      code: animalCode,
      organizationId: user.organizationId,
    });
    if (!findOneAnimal)
      throw new HttpException(
        `Animal ${findOneAnimal.code} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    await this.salesService.updateOne(
      { saleId: findOneSale.id },
      {
        note,
        price,
        phone,
        method,
        soldTo,
        userCreatedId: user?.id,
      },
    );

    await this.animalsService.updateOne(
      { animalId: findOneAnimal?.id },
      { status: status },
    );

    await this.activitylogsService.createOne({
      userId: user.id,
      organizationId: user.organizationId,
      message: `${user.profile?.firstName} ${user.profile?.lastName} updated a sale in ${findOneSale.type}`,
    });

    return reply({ res, results: 'Sale Updated Successfully' });
  }

  /** Post one Bulk sale */
  @Post(`/bulk/create`)
  @UseGuards(UserAuthGuard)
  async createOneBulk(@Res() res, @Req() req, @Body() body: BulkSalesDto) {
    const { user } = req;
    const {
      note,
      phone,
      email,
      price,
      method,
      soldTo,
      animals,
      quantity,
      address,
      assignTypeId,
    } = body;

    const findOneAssignType = await this.assignTypesService.findOneBy({
      assignTypeId,
      organizationId: user.organizationId,
    });
    if (!findOneAssignType)
      throw new HttpException(
        `AnimalType not assigned please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneUser = await this.usersService.findOneBy({ email });
    const findUniqueUser = await this.usersService.findMe({
      userId: user.id,
    });
    if (!findUniqueUser)
      throw new HttpException(`User not authenticated`, HttpStatus.NOT_FOUND);

    const newAnimalArrayPdf: any = [];
    const animalArrayPdfCodes: any = [];
    const animalArrayPdfWeights: any = [];
    const animalArrayPdfGenders: any = [];
    const animalArrayPdfTypes: any = [];

    for (const animal of animals) {
      const findOneAnimal = await this.animalsService.findOneBy({
        code: animal.code,
      });
      console.log('====>', findOneAnimal);
      if (findOneAnimal?.status === 'SOLD')
        throw new HttpException(
          `Animal ${findOneAnimal?.code} doesn't exists or already SOLD please change`,
          HttpStatus.NOT_FOUND,
        );

      // const findOneAnimalSold = await this.salesService.findOneBy({
      //   saleId,
      // });
      // if (findOneAnimalSold)
      //   throw new HttpException(
      //     `Animal ${findOneAnimal?.code} already SOLD please change`,
      //     HttpStatus.NOT_FOUND,
      //   );

      newAnimalArrayPdf.push({
        qr: `${config.datasite.url}/${config.api.prefix}/${config.api.version}/animals/view/${findOneAnimal?.id}`,
        fit: 80,
        margin: [0, 0, 0, 20],
        display: 'flex',
        width: '*',
        alignment: 'center',
        //foreground: 'red',
        //background: 'yellow',
        eccLevel: 'L',
      });

      animalArrayPdfCodes.push(findOneAnimal?.code);
      animalArrayPdfWeights.push(findOneAnimal?.weight);
      animalArrayPdfGenders.push(findOneAnimal?.gender);
      animalArrayPdfTypes.push(findOneAnimal?.animalType.name);

      if (findOneAnimal) {
        await this.animalsService.updateOne(
          { animalId: findOneAnimal.id },
          { status: 'SOLD' },
        );
      }
    }

    const sale = await this.salesService.createOne({
      note,
      email,
      price,
      phone,
      method,
      soldTo,
      address,
      animals: animals,
      quantity: animals.length,
      assigneTypeId: findOneAssignType.id,
      type: findOneAssignType.animalType.slug,
      organizationId: user.organizationId,
      userCreatedId: user.id,
    });

    await this.activitylogsService.createOne({
      userId: user.id,
      organizationId: user.organizationId,
      message: `${user.profile?.firstName} ${user.profile?.lastName} sold ${animals.lenght} ${sale.type} to ${soldTo}`,
    });

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
      watermark: {
        text: `${user?.organization?.name}`,
        color: 'blue',
        opacity: 0.1,
        bold: true,
        italics: false,
      },
      footer: function (currentPage, pageCount) {
        return {
          text: 'Page ' + currentPage.toString() + ' of ' + pageCount,
          alignment: 'right',
          style: 'normalText',
          margin: [10, 10, 10, 10],
        };
      },

      content: [
        {
          text: `${user?.organization?.logo}`,
          alignment: 'center',
          style: { fontSize: 10 },
          margin: [0, 10],
        },
        {
          text: `Animals sale reciept`,
          alignment: 'center',
          bold: true,
          style: { fontSize: 20 },
          margin: [0, 0, 0, 10],
        },
        {
          text: `Agreement between`,
          alignment: 'center',
          style: { fontSize: 12 },
          margin: [0, 0, 0, 10],
        },
        {
          text: `Seller: ${user?.organization?.name}`,
          style: { fontSize: 14 },
          margin: [0, 0, 0, 10],
        },
        {
          text: `Address: ${user?.profile?.address ? user?.profile?.address : 'N/A'}`,
          style: { fontSize: 14 },
          margin: [0, 0, 0, 10],
        },
        {
          text: `Email: ${user?.email ? user?.email : 'N/A'},  Phone: ${user?.profile?.phone ? user?.profile?.phone : 'N/A'},`,
          style: { fontSize: 14 },
          margin: [0, 0, 0, 10],
        },
        {
          text: `- AND -`,
          alignment: 'center',
          bold: true,
          style: { fontSize: 16 },
          margin: [0, 0, 0, 10],
        },
        {
          text: `Buyer: ${soldTo}`,
          style: { fontSize: 14 },
          margin: [0, 0, 0, 10],
        },
        {
          text: `Adresse: ${address ? address : 'N/A'}`,
          style: { fontSize: 14 },
          margin: [0, 0, 0, 10],
        },
        {
          text: `Email: ${email ? email : 'N/A'},  Phone: ${phone ? phone : 'N/A'}`,
          style: { fontSize: 14 },
          margin: [0, 0, 0, 10],
        },
        '\n',
        {
          text: `Below are the QRCodes of your animals and a sample of your animals informations you can have access to them through our organization by simply scanning them anytime`,
          style: { fontSize: 12 },
          margin: [0, 0, 0, 10],
        },
        {
          table: {
            body: [
              ['QRCodes', 'Description'],
              [
                newAnimalArrayPdf,
                [
                  note,
                  {
                    table: {
                      body: [
                        ['Codes', 'Weight(kg)', 'Gender', 'Type'],
                        [
                          animalArrayPdfCodes,
                          animalArrayPdfWeights,
                          animalArrayPdfGenders,
                          animalArrayPdfTypes,
                        ],
                      ],
                    },
                  },
                ],
              ],
            ],
          },
        },
        '\n',
        {
          text: `Quantity: ${animals.length} ${animals.length > 1 ? 'animals' : 'animal'} `,
          style: { fontSize: 12 },
          bold: true,
          margin: [0, 0, 0, 20],
        },
        {
          text: `Price:  ${price} ${findUniqueUser?.profile?.currency?.symbol}`,
          style: { fontSize: 12 },
          bold: true,
          margin: [0, 0, 0, 20],
        },
        {
          text: `It's been a pleasure working with you. Please don't hesitate to call or email us if you have any issues thanks`,
          style: { fontSize: 12 },
          margin: [0, 0, 0, 20],
        },
        '\n',
        {
          text: `Sold in ${method}, at ${user?.profile?.city} on ${formatDDMMYYDate(new Date())}`,
          style: { fontSize: 10 },
          margin: [0, 0, 0, 20],
        },
      ],
      defaultStyle: {
        font: 'Helvetica',
      },
    } as TDocumentDefinitions;

    const nameFile = `${formatNowDateYYMMDD(new Date())}-${generateUUID()}`;
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
    // const pdf = printer.createPdfKitDocument(docDefinition);
    // pdf.pipe(fs.createWriteStream(`${nameFile}.pdf`));
    // pdf.end();

    await awsS3ServiceAdapter({
      fileName: fileName,
      mimeType: 'application/pdf',
      folder: 'sales-pdf',
      file: Buffer.concat(chunks),
    });

    if (findOneUser) {
      await emailPDFAttachment({
        user,
        email: findOneUser.email,
        filename: fileName,
        content: Buffer.concat(chunks),
      });
    }

    if (!findOneUser) {
      await emailPDFAttachment({
        user,
        email: email,
        filename: fileName,
        content: Buffer.concat(chunks),
      });
    }

    return reply({ res, results: 'Sale saved successfully' });
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
      organizationId: user.organizationId,
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
  async getDownloadSales(@Res() res, @Req() req) {
    const { user } = req;
    try {
      await this.salesService.downloadToExcel(res, req);
      res.setHeader(
        'Content-Disposition',
        'attachment; filename= ' + 'SalesExport.xlsx',
      );
      await this.activitylogsService.createOne({
        userId: user.id,
        organizationId: user.organizationId,
        message: `${user.profile?.firstName} ${user.profile?.lastName} exported animals sale`,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error during download.');
    }
  }

  /** Pdf download */
  @Get(`/:folder/:name/download`)
  async getOneUploadedPDF(@Res() res, @Param() params: GetOneUploadsDto) {
    const { name, folder } = params;
    try {
      const { fileBuffer, contentType } = await getFileFromAws({
        folder,
        fileName: name,
      });
      res.status(200);
      res.contentType(contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${name}"`);
      res.set('Cross-Origin-Resource-Policy', 'cross-origin');
      res.send(fileBuffer);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error during file recovering.');
    }
  }

  /** Delete one Sale */
  @Delete(`/:saleId/delete`)
  @UseGuards(UserAuthGuard)
  async deleteOne(
    @Res() res,
    @Req() req,
    @Param('saleId', ParseUUIDPipe) saleId: string,
  ) {
    const { user } = req;
    const findOneSale = await this.salesService.findOneBy({
      saleId,
      organizationId: user.organizationId,
    });
    const sale = await this.salesService.updateOne(
      { saleId: findOneSale?.id },
      { deletedAt: new Date() },
    );

    await this.activitylogsService.createOne({
      userId: user.id,
      organizationId: user.organizationId,
      message: `${user.profile?.firstName} ${user.profile?.lastName} deleted a sale ${findOneSale.type}`,
    });

    return reply({ res, results: sale });
  }
}
