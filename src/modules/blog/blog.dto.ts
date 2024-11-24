import { Category, Status, Type } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateOrUpdateBlogDto {
  @IsOptional()
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

  @IsOptional()
  @IsString()
  readingTime: string;

  @IsOptional()
  @IsString()
  @IsEnum(Category)
  category: Category;

  @IsOptional()
  @IsString()
  @IsEnum(Status)
  status: Status;

  @IsOptional()
  @IsString()
  @IsEnum(Type)
  type: Type;
}

export class GetBlogQueryDto {
  @IsOptional()
  @IsString()
  @IsEnum(Category)
  category: Category;

  @IsNotEmpty()
  @IsString()
  @IsEnum(Status)
  status: Status;

  @IsNotEmpty()
  @IsString()
  @IsEnum(Type)
  type: Type;
}
