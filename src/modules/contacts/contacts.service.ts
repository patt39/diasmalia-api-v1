import { Injectable } from '@nestjs/common';
import { Contact, Prisma } from '@prisma/client';
import { DatabaseService } from '../../app/database/database.service';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import {
  CreateContactsOptions,
  GetContactsSelections,
  GetOneContactSelections,
  UpdateContactsOptions,
  UpdateContactsSelections,
} from './contacts.type';

@Injectable()
export class ContactsService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(
    selections: GetContactsSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhereContactUs = {} as Prisma.ContactWhereInput;
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

    const contacts = await this.client.contact.findMany({
      take: pagination.take,
      orderBy: pagination.orderBy,
      where: { ...prismaWhereContactUs, deletedAt: null },
    });
    const rowCount = await this.client.contact.count({
      where: { ...prismaWhereContactUs, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      value: contacts,
    });
  }

  /** Find one Contact in database. */
  async findOneBy(selections: GetOneContactSelections) {
    const { contactId } = selections;
    const contact = await this.client.contact.findUnique({
      where: {
        id: contactId,
      },
    });

    return contact;
  }

  /** Create one Contact in database. */
  async createOne(options: CreateContactsOptions): Promise<Contact> {
    const { subject, description, organizationId, userCreatedId } = options;

    const contact = this.client.contact.create({
      data: { subject, description, organizationId, userCreatedId },
    });

    return contact;
  }

  /** Update one Contact in database. */
  async updateOne(
    selections: UpdateContactsSelections,
    options: UpdateContactsOptions,
  ): Promise<Contact> {
    const { contactId } = selections;
    const { subject, description, organizationId, userCreatedId, deletedAt } =
      options;

    const contact = this.client.contact.update({
      where: {
        id: contactId,
      },
      data: { subject, description, organizationId, userCreatedId, deletedAt },
    });

    return contact;
  }
}
