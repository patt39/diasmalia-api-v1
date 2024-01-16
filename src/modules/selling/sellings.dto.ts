import { sellingMethod } from '@prisma/client';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsUUID,
  IsInt,
  IsDate,
  IsEnum,
} from 'class-validator';

export class CreateOrUpdateSellingsDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  note: string;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  animalId: string;

  @IsNotEmpty()
  @IsInt()
  @MaxLength(100)
  price: number;

  @IsNotEmpty()
  @IsDate()
  @MaxLength(100)
  date: Date;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @IsEnum(sellingMethod)
  method: sellingMethod;
}
