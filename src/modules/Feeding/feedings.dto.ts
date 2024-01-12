import { FeedType, ProductionPhase } from '@prisma/client';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsUUID,
  IsEnum,
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
  @IsString()
  @MaxLength(100)
  quantity: number;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  animalId: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @IsEnum(FeedType)
  type: FeedType;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @IsEnum(ProductionPhase)
  productionPhase: ProductionPhase;
}
