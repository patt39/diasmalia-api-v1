import { FeedCategory } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class UpdateFeedStocksDto {
  @IsNotEmpty()
  @IsString()
  @IsEnum(FeedCategory)
  feedCategory: FeedCategory;

  @IsNotEmpty()
  @IsNumber()
  number: number;

  @IsNotEmpty()
  @IsNumber()
  bagWeight: number;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  animalTypeId: string;
}

export class CreateFeedStocksDto {
  @IsNotEmpty()
  @IsNumber()
  number: number;

  @IsNotEmpty()
  @IsNumber()
  bagWeight: number;

  @IsNotEmpty()
  @IsString()
  @IsEnum(FeedCategory)
  feedCategory: FeedCategory;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  animalTypeId: string;
}

export class GetFeedStockQueryDto {
  @IsOptional()
  @IsString()
  @IsUUID()
  animalTypeId: string;

  @IsOptional()
  @IsString()
  animalTypeName: string;
}
