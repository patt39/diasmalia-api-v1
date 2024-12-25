import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import PdfPrinter from 'pdfmake';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import {
  formatDDMMYYDate,
  formatNowDateYYMMDD,
  formatWeight,
  generateUUID,
} from 'src/app/utils/commons';
import { Writable } from 'stream';
import { config } from '../../app/config/index';
import { DatabaseService } from '../../app/database/database.service';
import { RequestPaginationDto } from '../../app/utils/pagination/request-pagination.dto';
import {
  addPagination,
  PaginationType,
} from '../../app/utils/pagination/with-pagination';
import { reply } from '../../app/utils/reply';
import { SearchQueryDto } from '../../app/utils/search-query/search-query.dto';
import { AnimalsService } from '../animals/animals.service';
import { AssignTypesService } from '../assigne-type/assigne-type.service';
import { awsS3ServiceAdapter } from '../integrations/aws/aws-s3-service-adapter';
import { monthReportPDFAttachment } from '../users/mails/month-report-pdf-attachment';
import { UserAuthGuard } from '../users/middleware';
import { UsersService } from '../users/users.service';
import {
  GetOrganizationQueryDto,
  UpdateOrganizationsDto,
} from './organizations.dto';
import { OrganizationsService } from './organizations.service';

@Controller('organization')
export class OrganizationsController {
  constructor(
    private readonly organizationsService: OrganizationsService,
    private readonly usersService: UsersService,
    private readonly assignedTypesService: AssignTypesService,
    private readonly animalsService: AnimalsService,
    private readonly client: DatabaseService,
  ) {}

  /** Get all organizations */
  @Get(`/`)
  @UseGuards(UserAuthGuard)
  async findAll(
    @Res() res,
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() query: SearchQueryDto,
    @Query() queryOrganization: GetOrganizationQueryDto,
  ) {
    const { search } = query;
    const { userId } = queryOrganization;

    const { take, page, sort, sortBy } = requestPaginationDto;
    const pagination: PaginationType = addPagination({
      page,
      take,
      sort,
      sortBy,
    });

    const milkings = await this.organizationsService.findAll({
      search,
      userId,
      pagination,
    });

    return reply({ res, results: milkings });
  }

  /** Get one Organization */
  @Put(`/:organizationId/show`)
  @UseGuards(UserAuthGuard)
  async changeUserOrganization(
    @Res() res,
    @Req() req,
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
  ) {
    const { user } = req;
    const findOneOrganization = await this.organizationsService.findOneBy({
      organizationId,
    });
    if (!findOneOrganization)
      throw new HttpException(
        `OrganizationId: ${organizationId} doesn't exists, please change`,
        HttpStatus.NOT_FOUND,
      );

    const findUser = await this.usersService.updateOne(
      { userId: user?.id },
      { organizationId: findOneOrganization?.id },
    );

    return reply({ res, results: findUser });
  }

  /** Update organization */
  @Put(`/:organizationId/edit`)
  @UseGuards(UserAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: UpdateOrganizationsDto,
  ) {
    const { user } = req;
    const { name, description } = body;

    const findOrganization = await this.organizationsService.findOneBy({
      organizationId: user?.organizationId,
    });
    if (!findOrganization)
      throw new HttpException(
        `Organization doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    await this.organizationsService.updateOne(
      { organizationId: findOrganization?.id },
      { name, description },
    );

    return reply({ res, results: 'Organization Updated Successfully' });
  }

  /** Get one Organization */
  @Get(`/:organizationId/view`)
  @UseGuards(UserAuthGuard)
  async getUserOrganization(
    @Res() res,
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
  ) {
    const findOneOrganization = await this.organizationsService.findOneBy({
      organizationId,
    });
    if (!findOneOrganization)
      throw new HttpException(
        `OrganizationId: ${organizationId} doesn't exists, please change`,
        HttpStatus.NOT_FOUND,
      );

    const findUser = await this.usersService.findOneBy({
      organizationId: findOneOrganization?.id,
    });

    return reply({ res, results: findUser });
  }

  /** Get one Organization */
  @Get(`/:userId/view/organization`)
  @UseGuards(UserAuthGuard)
  async getOrganizationByUserId(
    @Res() res,
    @Req() req,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    const { user } = req;
    const findOneUser = await this.usersService.findOneBy({
      userId,
      organizationId: user?.organizationId,
    });
    if (!findOneUser)
      throw new HttpException(
        `User doesn't exists, please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOrganization = await this.organizationsService.findOneBy({
      userId: findOneUser?.id,
    });

    return reply({ res, results: findOrganization });
  }

  /** Delete one Organization */
  @Delete(`/:organizationId/delete`)
  @UseGuards(UserAuthGuard)
  async deleteOne(
    @Res() res,
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
  ) {
    const findOrganization = await this.organizationsService.findOneBy({
      organizationId,
    });
    if (!findOrganization)
      throw new HttpException(
        `OrganizationId: ${organizationId} doesn't exists, please change`,
        HttpStatus.NOT_FOUND,
      );

    await this.organizationsService.updateOne(
      { organizationId: findOrganization.id },
      { deletedAt: new Date() },
    );

    return reply({ res, results: 'Organization Deleted Successfully' });
  }

  /** Send  month report */
  @Put(`/send/report`)
  @UseGuards(UserAuthGuard)
  async changeStatus(@Res() res, @Req() req) {
    const { user } = req;

    const assigneTypes = await this.client.assignType.findMany({
      where: {
        userId: user?.id,
        organizationId: user?.organizationId,
      },
    });

    const findOneUser = await this.usersService.findOneBy({
      organizationId: user?.organizationId,
    });
    if (!findOneUser)
      throw new HttpException(`User not authenticated`, HttpStatus.NOT_FOUND);

    const findUniqueUser = await this.usersService.findMe({
      userId: user?.id,
    });
    if (!findUniqueUser)
      throw new HttpException(`User not authenticated`, HttpStatus.NOT_FOUND);

    for (const assignedType of assigneTypes) {
      const findOneType = await this.assignedTypesService.findOneBy({
        animalTypeId: assignedType?.id,
        organizationId: user?.organizationId,
      });

      if (
        ['Bovins', 'Cuniculture', 'Caprins', 'Ovins', 'Porsciculture'].includes(
          findOneType?.animalType?.name,
        )
      ) {
        const findOneAnimal = await this.animalsService.getAnimalTransactions({
          periode: '30',
          animalTypeId: findOneType?.id,
          organizationId: user?.organizationId,
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
          footer: function () {
            return {
              text: `Generated by ${config.datasite.name} on ${formatDDMMYYDate(new Date())}`,
              alignment: 'right',
              style: 'normalText',
              margin: [10, 10, 10, 10],
            };
          },

          content: [
            {
              text: `Rapport du mois de ${new Date().getMonth}`,
              alignment: 'center',
              bold: true,
              style: { fontSize: 20 },
              margin: [0, 0, 0, 10],
            },
            '\n',
            {
              text: `Effectif initial: ${findOneAnimal?.sumDeaths}`,
              style: { fontSize: 12 },
              margin: [0, 0, 0, 10],
            },
            '\n',
            {
              text: `Aliment consommé: ${findOneAnimal?.sumStocks}`,
              style: { fontSize: 12 },
              margin: [0, 0, 0, 10],
            },
            '\n',
            {
              text: `Poids à la vente: ${formatWeight(findOneAnimal?.prolificity)}`,
              style: { fontSize: 12 },
              margin: [0, 0, 0, 10],
            },
            '\n',
            {
              text: `Poids à la vente: ${formatWeight(findOneAnimal?.averageWeight)}`,
              style: { fontSize: 12 },
              margin: [0, 0, 0, 10],
            },
            '\n',
            {
              text: `Morts: ${findOneAnimal?.sumWeanings}`,
              style: { fontSize: 12 },
              margin: [0, 0, 0, 10],
            },
            '\n',
            {
              text: `Morts: ${findOneAnimal?.totalBreedings}`,
              style: { fontSize: 12 },
              margin: [0, 0, 0, 10],
            },
            '\n',
            {
              text: `Oeufs ramassés: ${findOneAnimal?.sumFemaleLactation}`,
              style: { fontSize: 12 },
              margin: [0, 0, 0, 10],
            },
            '\n',
            // {
            //   table: {
            //     body: [
            //       ['Poulets vendus', 'Montant'],
            //       [
            //         findOneAnimal?.chickenSaleCount,
            //         `${findOneAnimal?.chickenSaleAmount.toLocaleString('en-US')}${findUniqueUser?.profile?.currency?.symbol}`,
            //       ],
            //     ],
            //   },
            // },
            // '\n',
            // {
            //   table: {
            //     body: [
            //       ['Oeufs vendus', 'Montant'],
            //       [
            //         findOneAnimal?.eggSaleCount,
            //         `${findOneAnimal?.eggSaleAmount.toLocaleString('en-US')}${findUniqueUser?.profile?.currency?.symbol}`,
            //       ],
            //     ],
            //   },
            // },
            // '\n',
            // {
            //   table: {
            //     body: [
            //       ['Poussins vendus', 'Montant'],
            //       [
            //         findOneAnimal?.chickSaleCount,
            //         `${findOneAnimal?.chickSaleAmount.toLocaleString('en-US')}${findUniqueUser?.profile?.currency?.symbol}`,
            //       ],
            //     ],
            //   },
            // },
            // '\n',
            // {
            //   text: `Dépenses total: ${Number(String(findOneAnimal?.totalExpenses).slice(1)).toLocaleString('en-US')}${findUniqueUser?.profile?.currency?.symbol}`,
            //   bold: true,
            //   alignment: 'right',
            //   style: { fontSize: 12 },
            //   margin: [0, 0, 0, 10],
            // },
            '\n',
            // {
            //   text: `Revenu net: ${revenu.toLocaleString('en-US')} ${findUniqueUser?.profile?.currency?.symbol}`,
            //   bold: true,
            //   alignment: 'right',
            //   style: { fontSize: 12 },
            //   margin: [0, 0, 0, 10],
            // },
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

        await awsS3ServiceAdapter({
          fileName: fileName,
          mimeType: 'application/pdf',
          folder: 'sales-pdf',
          file: Buffer.concat(chunks),
        });

        await monthReportPDFAttachment({
          email: findOneUser?.email,
          filename: fileName,
          content: Buffer.concat(chunks),
        });
      }
    }

    return reply({ res, results: 'Report send successfully' });
  }
}
