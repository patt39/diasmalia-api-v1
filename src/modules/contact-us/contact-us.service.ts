import { Injectable } from '@nestjs/common';
import { ContactUs, Prisma } from '@prisma/client';
import { DatabaseService } from '../../app/database/database.service';
import {
  withPagination,
  WithPaginationResponse,
} from '../../app/utils/pagination';
import {
  CreateContactUsOptions,
  GetContactUsSelections,
  GetOneContactUsSelections,
  UpdateContactUsOptions,
  UpdateContactUsSelections,
} from './contact-us.type';

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

    const contacts = await this.client.contactUs.findMany({
      take: pagination.take,
      orderBy: pagination.orderBy,
      where: { ...prismaWhereContactUs, deletedAt: null },
    });
    const rowCount = await this.client.contactUs.count({
      where: { ...prismaWhereContactUs, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      value: contacts,
    });
  }

  /** Find one ContactUs in database. */
  async findOneBy(selections: GetOneContactUsSelections) {
    const { contactUsId } = selections;
    const contactUs = await this.client.contactUs.findUnique({
      where: {
        id: contactUsId,
      },
    });

    return contactUs;
  }

  /** Create one ContactUs in database. */
  async createOne(options: CreateContactUsOptions): Promise<ContactUs> {
    const { fullName, email, phone, subject, description } = options;

    const contactUs = this.client.contactUs.create({
      data: { fullName, email, phone, subject, description },
    });

    return contactUs;
  }

  /** Update one ContactUs in database. */
  async updateOne(
    selections: UpdateContactUsSelections,
    options: UpdateContactUsOptions,
  ): Promise<ContactUs> {
    const { contactUsId } = selections;
    const { fullName, email, subject, description, deletedAt } = options;

    const contactUs = this.client.contactUs.update({
      where: { id: contactUsId },
      data: { fullName, email, subject, description, deletedAt },
    });

    return contactUs;
  }
}
