import { Injectable } from '@nestjs/common';
import { Faq, Prisma } from '@prisma/client';
import { DatabaseService } from '../../app/database/database.service';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import {
  CreateFaqsOptions,
  GetFaqsSelections,
  GetOneFaqSelections,
  UpdateFaqsOptions,
  UpdateFaqsSelections,
} from './faq.type';

@Injectable()
export class FaqsService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(
    selections: GetFaqsSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhereFaq = {} as Prisma.FaqWhereInput;
    const { pagination } = selections;

    const contacts = await this.client.faq.findMany({
      take: pagination.take,
      orderBy: pagination.orderBy,
      where: { ...prismaWhereFaq, deletedAt: null },
    });
    const rowCount = await this.client.faq.count({
      where: { ...prismaWhereFaq, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      value: contacts,
    });
  }

  /** Find one Faq in database. */
  async findOneBy(selections: GetOneFaqSelections) {
    const { faqId } = selections;
    const faq = await this.client.faq.findUnique({
      where: {
        id: faqId,
      },
    });

    return faq;
  }

  /** Create one Faq in database. */
  async createOne(options: CreateFaqsOptions): Promise<Faq> {
    const { title, description, userCreatedId } = options;

    const faq = this.client.faq.create({
      data: {
        title,
        description,
        userCreatedId,
      },
    });

    return faq;
  }

  /** Update Faq in database. */
  async updateOne(
    selections: UpdateFaqsSelections,
    options: UpdateFaqsOptions,
  ): Promise<Faq> {
    const { faqId } = selections;
    const { title, description, userCreatedId, deletedAt } = options;

    const contact = this.client.faq.update({
      where: { id: faqId },
      data: { title, description, userCreatedId, deletedAt },
    });

    return contact;
  }
}
