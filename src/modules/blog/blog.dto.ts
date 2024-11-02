import { Category } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateOrUpdateBlogDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  image: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  urlMedia: string;

  @IsNotEmpty()
  @IsString()
  readingTime: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(Category)
  category: Category;
}

export class GetBlogByCategoriesDto {
  @IsOptional()
  @IsString()
  @IsEnum(Category)
  category: Category;
}
