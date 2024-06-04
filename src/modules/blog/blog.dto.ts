import { Category } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateOrUpdateBlogDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  image: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(Category)
  category: Category;
}

export class GetBlogByCategoriesDto {
  @IsNotEmpty()
  @IsString()
  @IsEnum(Category)
  category: Category;
}
