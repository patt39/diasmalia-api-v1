import { FeedType } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
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
  @IsString()
  date: Date;

  @IsNotEmpty()
  quantity: number;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  batchId: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(FeedType)
  feedType: FeedType;
}
