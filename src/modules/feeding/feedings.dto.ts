import { FeedType, ProductionPhase } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateOrUpdateFeedingsDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  note: string;

  @IsNotEmpty()
  @IsString()
  date: Date;

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
}
