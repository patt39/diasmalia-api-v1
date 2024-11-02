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
    const { search, pagination } = selections;

    if (search) {
      Object.assign(prismaWhere, {
        OR: [{ name: { contains: search, mode: 'insensitive' } }],
      });
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

    const { blogId, category, slug } = selections;

    if (blogId) {
      Object.assign(prismaWhere, { id: blogId });
    }

    if (slug) {
      Object.assign(prismaWhere, { slug });
    }

    if (category) {
      Object.assign(prismaWhere, { category });
    }

    const blog = await this.client.blog.findFirst({
      where: { ...prismaWhere, deletedAt: null },
    });

    return blog;
  }

  /** Create one blog in database. */
  async createOne(options: CreateBlogsOptions): Promise<Blog> {
    const {
      readingTime,
      urlMedia,
      image,
      title,
      description,
      category,
      userCreatedId,
    } = options;

    const blog = this.client.blog.create({
      data: {
        title,
        image,
        urlMedia,
        category,
        description,
        readingTime,
        slug: `${Slug(title)}-${generateNumber(4)}`,
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
      readingTime,
      urlMedia,
      title,
      image,
      category,
      description,
      deletedAt,
    } = options;

    const blog = this.client.blog.update({
      where: { id: blogId },
      data: {
        readingTime,
        urlMedia,
        title,
        description,
        category,
        image,
        deletedAt,
      },
    });

    return blog;
  }
}
