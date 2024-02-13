import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateContactUsOptions,
  GetContactUsSelections,
  GetOneContactUsSelections,
  UpdateContactUsOptions,
  UpdateContactUsSelections,
} from './contact-us.type';
import { DatabaseService } from '../../app/database/database.service';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import { ContactUs, Prisma } from '@prisma/client';
import { useCatch } from '../../app/utils/use-catch';

@Injectable()
export class ContactUsService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(
    selections: GetContactUsSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhereContactUs = {} as Prisma.ContactUsWhereInput;
    const { search, pagination } = selections;

    if (search) {
      Object.assign(prismaWhereContactUs, {
        OR: [
          {
            fullName: { contains: search, mode: 'insensitive' },
            description: { contains: search, mode: 'insensitive' },
            email: { contains: search, mode: 'insensitive' },
          },
        ],
      });
    }

    const contactUs = await this.client.contactUs.findMany({
      take: pagination.take,
      orderBy: pagination.orderBy,
      where: { ...prismaWhereContactUs, deletedAt: null },
      skip: pagination?.cursor ? 1 : pagination.skip,
      cursor: pagination.cursor ? { id: pagination.cursor } : undefined,
    });
    const rowCount = await this.client.contactUs.count({
      where: { ...prismaWhereContactUs, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      value: contactUs,
    });
  }

  /** Find one ContactUs to the database. */
  async findOneBy(selections: GetOneContactUsSelections) {
    const { contactUsId } = selections;
    const contact = await this.client.contactUs.findUnique({
      where: {
        id: contactUsId,
      },
    });

    return contact;
  }

  /** Create one ContactUs to the database. */
  async createOne(options: CreateContactUsOptions): Promise<ContactUs> {
    const { fullName, email, subject, description } = options;

    const contactUs = this.client.contactUs.create({
      data: { fullName, email, subject, description },
    });

    const [error, result] = await useCatch(contactUs);
    if (error) throw new NotFoundException(error);

    return result;
  }

  /** Update one ContactUs to the database. */
  async updateOne(
    selections: UpdateContactUsSelections,
    options: UpdateContactUsOptions,
  ): Promise<ContactUs> {
    const { contactUsId } = selections;
    const { fullName, email, subject, description, deletedAt } = options;

    const contactUs = this.client.contactUs.update({
      where: {
        id: contactUsId,
      },
      data: { fullName, email, subject, description, deletedAt },
    });

    const [error, result] = await useCatch(contactUs);
    if (error) throw new NotFoundException(error);

    return result;
  }
}
