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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { reply } from '../../app/utils/reply';

import { FileInterceptor } from '@nestjs/platform-express';
import { RequestPaginationDto } from '../../app/utils/pagination/request-pagination.dto';
import {
  addPagination,
  PaginationType,
} from '../../app/utils/pagination/with-pagination';
import { SearchQueryDto } from '../../app/utils/search-query/search-query.dto';
import { UploadsUtil } from '../integrations/integration.utils';
import { UserAuthGuard } from '../users/middleware';
import { CreateOrUpdateBlogDto, GetBlogQueryDto } from './blog.dto';
import { BlogService } from './blog.service';

@Controller('blogs')
export class BlogController {
  constructor(
    private readonly blogService: BlogService,
    private readonly uploadsUtil: UploadsUtil,
  ) {}

  /** Get all blogs */
  @Get(`/`)
  @UseGuards(UserAuthGuard)
  async findAll(
    @Res() res,
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() query: SearchQueryDto,
    @Query() queryBlogs: GetBlogQueryDto,
  ) {
    const { search } = query;
    const { category, type, status } = queryBlogs;

    const { take, page, sort, sortBy } = requestPaginationDto;
    const pagination: PaginationType = addPagination({
      page,
      take,
      sort,
      sortBy,
    });

    const blog = await this.blogService.findAll({
      type,
      status,
      search,
      category,
      pagination,
    });

    return reply({ res, results: blog });
  }

  /** Post one blog */
  @Post(`/create`)
  @UseGuards(UserAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateBlogDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const { user } = req;
    const {
      readingTime,
      urlMedia,
      title,
      description,
      category,
      status,
      type,
    } = body;

    const { urlAWS } = await this.uploadsUtil.uploadOneAWS({
      file,
      userId: user?.id,
      folder: 'photos',
    });

    const blog = await this.blogService.createOne({
      type,
      title,
      status,
      urlMedia,
      category,
      description,
      readingTime,
      image: urlAWS?.Location,
      userCreatedId: user?.id,
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
    const {
      readingTime,
      urlMedia,
      title,
      description,
      image,
      category,
      status,
      type,
    } = body;

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
        status,
        type,
        title,
        image,
        urlMedia,
        category,
        readingTime,
        description,
      },
    );

    return reply({ res, results: blog });
  }

  /** Get one blog */
  @Get(`/:slug/view`)
  @UseGuards(UserAuthGuard)
  async getOneBLogBySlug(@Res() res, @Param('slug') slug: string) {
    const findOneBlog = await this.blogService.findOneBy({
      slug,
    });
    if (!findOneBlog)
      throw new HttpException(
        `BlogId: ${slug} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    return reply({ res, results: findOneBlog });
  }

  /** Delete one blog */
  @Delete(`/:blogId/delete`)
  @UseGuards(UserAuthGuard)
  async deleteOne(@Res() res, @Param('blogId', ParseUUIDPipe) blogId: string) {
    const findOneBlog = await this.blogService.findOneBy({
      blogId,
    });
    if (!findOneBlog)
      throw new HttpException(
        `BlogId: ${blogId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    await this.blogService.updateOne(
      { blogId: findOneBlog?.id },
      { deletedAt: new Date() },
    );

    return reply({ res, results: 'Blog deleted successfully' });
  }
}
