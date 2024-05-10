import { FeedType, ProductionPhase } from '@prisma/client';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateOrUpdateFeedingsDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  note: string;

  @IsNotEmpty()
  quantity: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  code: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(FeedType)
  feedType: FeedType;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @IsEnum(ProductionPhase)
  productionPhase: ProductionPhase;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  animalTypeId: string;
}

export class BulkFeedingsDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  note: string;

  @IsNotEmpty()
  @IsArray()
  animals: any;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsNotEmpty()
  @IsString()
  @IsEnum(FeedType)
  feedType: FeedType;

  @IsNotEmpty()
  @IsString()
  @IsEnum(ProductionPhase)
  productionPhase: ProductionPhase;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  animalTypeId: string;
}

export class GetFeedQueryDto {
  @IsOptional()
  @IsString()
  @IsEnum(FeedType)
  feedType: FeedType;

  @IsOptional()
  @IsString()
  @IsUUID()
  animalTypeId: string;
}
