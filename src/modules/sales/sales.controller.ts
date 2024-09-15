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
import axios from 'axios';
import PdfPrinter from 'pdfmake';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { Writable } from 'stream';
import { config } from '../../app/config/index';
import { generateUUID } from '../../app/utils/commons';
import { RequestPaginationDto } from '../../app/utils/pagination/request-pagination.dto';
import {
  addPagination,
  PaginationType,
} from '../../app/utils/pagination/with-pagination';
import { reply } from '../../app/utils/reply';
import { SearchQueryDto } from '../../app/utils/search-query/search-query.dto';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { AnimalsService } from '../animals/animals.service';
import { FinancesService } from '../finances/finances.service';
import { awsS3ServiceAdapter } from '../integrations/aws/aws-s3-service-adapter';
import { UploadsUtil } from '../integrations/integration.utils';
import { emailPDFAttachment } from '../users/mails/email-pdf-attachment';
import { UserAuthGuard } from '../users/middleware';
import { UsersService } from '../users/users.service';
import {
  formatDDMMYYDate,
  formatNowDateYYMMDD,
} from './../../app/utils/commons/formate-date';
import {
  BulkSalesDto,
  CreateSalesDto,
  SalesDto,
  UpdateSalesDto,
} from './sales.dto';
import { SalesService } from './sales.service';

@Controller('sales')
export class SalesController {
  constructor(
    private readonly uploadsUtil: UploadsUtil,
    private readonly salesService: SalesService,
    private readonly animalsService: AnimalsService,
    private readonly usersService: UsersService,
    private readonly financesService: FinancesService,
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
    const { method, animalTypeId, detail, periode } = querySaleMethod;

    const { take, page, sort, sortBy } = requestPaginationDto;
    const pagination: PaginationType = addPagination({
      page,
      take,
      sort,
      sortBy,
    });

    const sales = await this.salesService.findAll({
      detail,
      method,
      search,
      pagination,
      animalTypeId,
      periode: Number(periode),
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
    @Body() body: UpdateSalesDto,
    @Param('saleId', ParseUUIDPipe) saleId: string,
  ) {
    const { user } = req;
    const { note, price, method, soldTo, phone, detail, number } = body;

    const findOneSale = await this.salesService.findOneBy({
      saleId,
      organizationId: user.organizationId,
    });
    if (!findOneSale)
      throw new HttpException(
        `SaleId: ${saleId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    await this.salesService.updateOne(
      { saleId: findOneSale?.id },
      {
        note,
        price,
        phone,
        method,
        soldTo,
        detail,
        number,
        userCreatedId: user?.id,
      },
    );

    await this.activitylogsService.createOne({
      userId: user?.id,
      organizationId: user?.organizationId,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} updated a sale in ${findOneSale?.type}`,
    });

    return reply({ res, results: 'Sale Updated Successfully' });
  }

  /** Post one aves sale */
  @Post(`/create/aves`)
  @UseGuards(UserAuthGuard)
  async createOne(@Res() res, @Req() req, @Body() body: CreateSalesDto) {
    const { user } = req;
    const {
      code,
      male,
      female,
      detail,
      phone,
      email,
      price,
      method,
      soldTo,
      number,
      address,
    } = body;

    const sumAnimals = Number(male + female);

    const findOneAnimal = await this.animalsService.findOneAnimalDetails({
      code,
      status: 'ACTIVE',
      organizationId: user?.organizationId,
    });
    if (!findOneAnimal)
      throw new HttpException(
        `Animal ${findOneAnimal?.code} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    const totalEggHarvested = findOneAnimal?.eggHavestedCount;
    const totalIncubations = findOneAnimal?.incubationCount;
    const totalEggsHatched = findOneAnimal?.eggHatchedCount;
    const totalSaleChicks = findOneAnimal?.chickSaleCount;

    const eggDifference = Number(totalEggHarvested - totalIncubations);
    const chicksDifference = Number(totalEggsHatched - totalSaleChicks);

    if (detail === 'EGGS' && eggDifference < number)
      throw new HttpException(
        `Impossible to sell in this band code: ${findOneAnimal?.code} no egg or insufficient availability: ${eggDifference}`,
        HttpStatus.NOT_FOUND,
      );

    if (detail === 'CHICKS' && chicksDifference < number)
      throw new HttpException(
        `Impossible to sell in this band code: ${findOneAnimal?.code} no chicks or insufficient availability: ${chicksDifference}`,
        HttpStatus.NOT_FOUND,
      );

    if (detail === 'EGGS' && findOneAnimal?._count?.eggHavestings === 0)
      throw new HttpException(
        `Impossible to sell in this band code: ${findOneAnimal?.code} no egg harvested yet please change`,
        HttpStatus.NOT_FOUND,
      );

    if (detail === 'CHICKS' && findOneAnimal?._count?.incubations === 0)
      throw new HttpException(
        `Impossible to sell in this band code: ${findOneAnimal?.code} no eggs incubated yet please change`,
        HttpStatus.NOT_FOUND,
      );

    if (
      ['CHICKS', 'CHICKENS'].includes(detail) &&
      findOneAnimal?.female < female
    )
      throw new HttpException(
        `Impossible to sell in this band code: ${findOneAnimal?.code} not enough females please change`,
        HttpStatus.NOT_FOUND,
      );

    if (['CHICKS', 'CHICKENS'].includes(detail) && findOneAnimal?.male < male)
      throw new HttpException(
        `Impossible to sell in this band code: ${findOneAnimal?.code} not enough males please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneUser = await this.usersService.findOneBy({ email });
    const findUniqueUser = await this.usersService.findMe({
      userId: user?.id,
    });
    if (!findUniqueUser)
      throw new HttpException(`User not authenticated`, HttpStatus.NOT_FOUND);

    if (
      findOneAnimal?.quantity < number ||
      findOneAnimal?.quantity < sumAnimals
    )
      throw new HttpException(
        `Impossible to sell insuficient animals available`,
        HttpStatus.NOT_FOUND,
      );

    const sale = await this.salesService.createOne({
      male,
      female,
      phone,
      email,
      price,
      method,
      soldTo,
      address,
      detail,
      animalId: findOneAnimal?.id,
      number: number ? number : sumAnimals,
      type: findOneAnimal?.animalType?.name,
      animalTypeId: findOneAnimal?.animalTypeId,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    await this.animalsService.updateOne(
      { animalId: findOneAnimal?.id },
      {
        female: findOneAnimal?.female - female,
        male: findOneAnimal?.male - male,
        quantity: findOneAnimal?.quantity - sale?.number,
      },
    );

    if (findOneAnimal?.quantity - sale?.number === 0) {
      await this.animalsService.updateOne(
        { animalId: findOneAnimal?.id },
        { status: 'SOLD' },
      );
    }

    await this.financesService.createOne({
      type: 'INCOME',
      detail: `Sale of ${detail} `,
      organizationId: user.organizationId,
      userCreatedId: user.id,
      amount: price,
    });

    await this.activitylogsService.createOne({
      userId: user.id,
      message: `${user.profile?.firstName} ${user.profile?.lastName} added a sale ${findOneAnimal.animalType.name} with code ${findOneAnimal?.code} `,
      organizationId: user.organizationId,
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
      footer: function () {
        return {
          text: `Generated by ${config.datasite.name}`,
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
          table: {
            body: [
              [
                'Animal Type',
                'Number',
                'Age',
                'Weight(kg)',
                'Production phase',
              ],
              [
                findOneAnimal?.animalType?.slug,
                sale?.number,
                findOneAnimal?.birthday,
                findOneAnimal?.weight,
                findOneAnimal?.productionPhase,
              ],
            ],
          },
        },
        '\n',
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

    const awsPdf = await awsS3ServiceAdapter({
      fileName: fileName,
      mimeType: 'application/pdf',
      folder: 'sales-pdf',
      file: Buffer.concat(chunks),
    });

    await this.salesService.updateOne(
      { saleId: sale?.id },
      { salePdf: awsPdf?.Location },
    );

    if (findOneUser) {
      await emailPDFAttachment({
        user,
        email: findOneUser?.email,
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

    return reply({
      res,
      results: {
        status: HttpStatus.CREATED,
        data: sale,
        message: `Sale Created Successfully`,
      },
    });
  }

  /** Post one Bulk sale */
  @Post(`/bulk/create`)
  @UseGuards(UserAuthGuard)
  async createOneBulk(@Res() res, @Req() req, @Body() body: BulkSalesDto) {
    const { user } = req;
    const { note, phone, email, price, method, soldTo, animals, address } =
      body;

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
    const animalArrayPdfTypesId: any = [];

    for (const animal of animals) {
      const findOneAnimal = await this.animalsService.findOneBy({
        code: animal,
        status: 'ACTIVE',
      });
      if (!findOneAnimal)
        throw new HttpException(
          `Animal ${findOneAnimal?.code} doesn't exists or isn't active please change`,
          HttpStatus.NOT_FOUND,
        );

      newAnimalArrayPdf.push({
        qr: `${config.datasite.url}/${config.api.prefix}/${config.api.version}/animals/${findOneAnimal?.id}/view`,
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
      animalArrayPdfTypesId.push(findOneAnimal?.animalType?.id);
      animalArrayPdfTypes.push(findOneAnimal?.animalType?.slug);

      if (findOneAnimal) {
        await this.animalsService.updateOne(
          { animalId: findOneAnimal?.id },
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
      number: animals.length,
      type: animalArrayPdfTypes[0],
      animalTypeId: animalArrayPdfTypesId[0],
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    await this.activitylogsService.createOne({
      userId: user.id,
      organizationId: user.organizationId,
      message: `${user.profile?.firstName} ${user.profile?.lastName} sold ${animals.lenght} ${sale.type} to ${soldTo}`,
    });

    await this.financesService.createOne({
      detail: note,
      type: 'INCOME',
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
      amount: price,
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

    const awsPdf = await awsS3ServiceAdapter({
      fileName: fileName,
      mimeType: 'application/pdf',
      folder: 'sales-pdf',
      file: Buffer.concat(chunks),
    });

    await this.salesService.updateOne(
      { saleId: sale?.id },
      { salePdf: awsPdf?.Location },
    );

    if (findOneUser) {
      await emailPDFAttachment({
        user,
        email: findOneUser?.email,
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
  @Get(`/:saleId/view`)
  @UseGuards(UserAuthGuard)
  async getOneSaleById(
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

  /** Get one animalType sale */
  @Get(`/:animalTypeId/view/animalType`)
  @UseGuards(UserAuthGuard)
  async getOneSaleByAnimalTypeId(
    @Res() res,
    @Req() req,
    @Param('animalTypeId', ParseUUIDPipe) animalTypeId: string,
  ) {
    const { user } = req;

    const findOneSaleAnimalType = await this.salesService.findOneBy({
      animalTypeId,
      organizationId: user?.organizationId,
    });
    if (!findOneSaleAnimalType)
      throw new HttpException(
        `AnimalTypeId: ${animalTypeId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    return reply({ res, results: findOneSaleAnimalType });
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
        userId: user?.id,
        organizationId: user?.organizationId,
        message: `${user?.profile?.firstName} ${user?.profile?.lastName} exported animals sale`,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error during download.');
    }
  }

  /** Pdf download */
  @Get(`/:saleId/download`)
  async getOneUploadedPDF(
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
    try {
      const pdfResponse = await axios.get(findOneSale?.salePdf, {
        responseType: 'arraybuffer', // Ensures the PDF is handled as a binary
      });
      const fileName = `document_${findOneSale?.id}.pdf`;
      res.status(200);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${fileName}"`,
      );
      res.set('Cross-Origin-Resource-Policy', 'cross-origin');
      res.send(pdfResponse.data);
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
      userId: user?.id,
      organizationId: user?.organizationId,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} deleted a sale ${findOneSale?.type}`,
    });

    return reply({ res, results: sale });
  }
}
