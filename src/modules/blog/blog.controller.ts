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
import { reply } from '../../app/utils/reply';

import { RequestPaginationDto } from '../../app/utils/pagination/request-pagination.dto';
import {
  addPagination,
  PaginationType,
} from '../../app/utils/pagination/with-pagination';
import { SearchQueryDto } from '../../app/utils/search-query/search-query.dto';
import { UserAuthGuard } from '../users/middleware';
import { CreateOrUpdateBlogDto } from './blog.dto';
import { BlogService } from './blog.service';

@Controller('blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  /** Get all blogs */
  @Get(`/`)
  @UseGuards(UserAuthGuard)
  async findAll(
    @Res() res,
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() query: SearchQueryDto,
  ) {
    const { search } = query;

    const { take, page, sort, sortBy } = requestPaginationDto;
    const pagination: PaginationType = addPagination({
      page,
      take,
      sort,
      sortBy,
    });

    const breeds = await this.blogService.findAll({
      search,
      pagination,
    });

    return reply({ res, results: breeds });
  }

  /** Post one blog */
  @Post(`/create`)
  @UseGuards(UserAuthGuard)
  async createOne(@Res() res, @Req() req, @Body() body: CreateOrUpdateBlogDto) {
    const { user } = req;
    const { title, description, category, image } = body;

    const blog = await this.blogService.createOne({
      image,
      title,
      category,
      description,
      userCreatedId: user.id,
    });

    return reply({ res, results: blog });
  }

  /** Update one blog */
  @Put(`/:blogId/edit`)
  @UseGuards(UserAuthGuard)
  async updateOne(
    @Res() res,
    @Body() body: CreateOrUpdateBlogDto,
    @Param('blogId', ParseUUIDPipe) blogId: string,
  ) {
    const { title, description, image, category } = body;

    const findOneBlog = await this.blogService.findOneBy({
      blogId,
    });
    if (!findOneBlog)
      throw new HttpException(
        `BlogId: ${blogId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const blog = await this.blogService.updateOne(
      { blogId: findOneBlog?.id },
      {
        title,
        image,
        category,
        description,
      },
    );

    return reply({ res, results: blog });
  }

  /** Get one blog */
  @Get(`/view/slug`)
  @UseGuards(UserAuthGuard)
  async getOneByIdBreed(@Res() res, @Req() req, @Param('slug') blogId: string) {
    const findOneBlog = await this.blogService.findOneBy({
      blogId,
    });
    if (!findOneBlog)
      throw new HttpException(
        `BlogId: ${blogId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    return reply({ res, results: findOneBlog });
  }

  /** Delete one breed */
  @Delete(`/delete/:blogId`)
  @UseGuards(UserAuthGuard)
  async deleteOne(@Res() res, @Param('blogId', ParseUUIDPipe) blogId: string) {
    const findOneBlog = await this.blogService.findOneBy({
      blogId,
    });
    if (!findOneBlog)
      throw new HttpException(
        `BreedId: ${blogId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    await this.blogService.updateOne(
      { blogId: findOneBlog?.id },
      { deletedAt: new Date() },
    );

    return reply({ res, results: 'Blog deleted successfully' });
  }
}
