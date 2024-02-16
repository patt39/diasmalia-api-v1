import { sellingMethod } from '@prisma/client';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateOrUpdateSellingsDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  note: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  code: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  soldTo: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  phone: string;

  @IsNotEmpty()
  @IsInt()
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

export class BulkSalesDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  note: string;

  @IsNotEmpty()
  @IsString()
  date: Date;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  soldTo: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  phone: string;

  @IsNotEmpty()
  @IsInt()
  price: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @IsEnum(sellingMethod)
  method: sellingMethod;

  @IsNotEmpty()
  @IsArray()
  animals: any;
}
export class SaleMethodDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @IsEnum(sellingMethod)
  method: sellingMethod;
}
