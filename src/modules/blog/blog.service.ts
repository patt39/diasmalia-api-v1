import { Injectable } from '@nestjs/common';
import { Blog, Prisma } from '@prisma/client';
import { generateNumber, Slug } from 'src/app/utils/commons';
import { DatabaseService } from '../../app/database/database.service';
import {
  withPagination,
  WithPaginationResponse,
} from '../../app/utils/pagination';
import {
  BlogSelect,
  CreateBlogsOptions,
  GetBlogsSelections,
  GetOneBlogSelections,
  UpdateBlogsOptions,
  UpdateBlogsSelections,
} from './blog.type';

@Injectable()
export class BlogService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(
    selections: GetBlogsSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhere = {} as Prisma.BlogWhereInput;
    const { search, pagination, category, status, type } = selections;

    if (search) {
      Object.assign(prismaWhere, {
        OR: [{ name: { contains: search, mode: 'insensitive' } }],
      });
    }

    if (type) {
      Object.assign(prismaWhere, { type });
    }

    if (status) {
      Object.assign(prismaWhere, { status });
    }

    if (category) {
      Object.assign(prismaWhere, { category });
    }

    const blogs = await this.client.blog.findMany({
      where: { ...prismaWhere, deletedAt: null },
      take: pagination.take,
      skip: pagination.skip,
      select: BlogSelect,
      orderBy: pagination.orderBy,
    });

    const rowCount = await this.client.blog.count({
      where: { ...prismaWhere, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      value: blogs,
    });
  }

  /** Find one blog in database. */
  async findOneBy(selections: GetOneBlogSelections) {
    const prismaWhere = {} as Prisma.BlogWhereInput;

    const { blogId, slug } = selections;

    if (blogId) {
      Object.assign(prismaWhere, { id: blogId });
    }

    if (slug) {
      Object.assign(prismaWhere, { slug });
    }

    const blog = await this.client.blog.findFirst({
      where: { ...prismaWhere, deletedAt: null },
    });

    return blog;
  }

  /** Create one blog in database. */
  async createOne(options: CreateBlogsOptions): Promise<Blog> {
    const {
      type,
      image,
      title,
      status,
      urlMedia,
      category,
      readingTime,
      description,
      userCreatedId,
    } = options;

    const blog = this.client.blog.create({
      data: {
        type,
        image,
        title,
        status,
        urlMedia,
        category,
        description,
        readingTime,
        slug: `${Slug(type === 'POLICY_PRIVACY' ? 'Policy privacy' : type === 'TERM_CONDITIONS' ? 'Terms and condition' : title)}-${generateNumber(4)}`,
        userCreatedId,
      },
    });

    return blog;
  }

  /** Update one blog in database. */
  async updateOne(
    selections: UpdateBlogsSelections,
    options: UpdateBlogsOptions,
  ): Promise<Blog> {
    const { blogId } = selections;
    const {
      type,
      title,
      image,
      status,
      urlMedia,
      category,
      readingTime,
      description,
      deletedAt,
    } = options;

    const blog = this.client.blog.update({
      where: { id: blogId },
      data: {
        type,
        title,
        image,
        status,
        category,
        urlMedia,
        readingTime,
        description,
        deletedAt,
      },
    });

    return blog;
  }
}
