import { BirdType } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateOrUpdateBatchsDto {
  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsNotEmpty()
  @IsNumber()
  weight: number;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  locationId: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(BirdType)
  type: BirdType;
}

export class GetBirdsByType {
  @IsNotEmpty()
  @IsString()
  @IsEnum(BirdType)
  type: BirdType;
}
