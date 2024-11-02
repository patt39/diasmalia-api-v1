import { Blog, Category } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetBlogsSelections = {
  search?: string;
  pagination?: PaginationType;
};

export type GetOneBlogSelections = {
  slug?: Blog['slug'];
  blogId?: Blog['id'];
  category?: Category;
};

export type UpdateBlogsSelections = {
  blogId: Blog['id'];
};

export type CreateBlogsOptions = Partial<Blog>;

export type UpdateBlogsOptions = Partial<Blog>;

export const BlogSelect = {
  createdAt: true,
  id: true,
  title: true,
  image: true,
  slug: true,
  readingTime: true,
  urlMedia: true,
  description: true,
  category: true,
};
