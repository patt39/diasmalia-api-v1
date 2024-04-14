import { AnimalStatus, sellingMethod } from '@prisma/client';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateOrUpdateSalesDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  note: string;

  @IsOptional()
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
  @IsNumber()
  price: number;

  @IsNotEmpty()
  @IsString()
  date: Date;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @IsEnum(sellingMethod)
  method: sellingMethod;

  @IsOptional()
  @IsString()
  @IsEnum(AnimalStatus)
  status: AnimalStatus;
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
  email: string;

  @IsOptional()
  @IsString()
  address: string;

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

  @IsNotEmpty()
  @IsString()
  type: string;
}
export class SaleMethodDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @IsEnum(sellingMethod)
  method: sellingMethod;

  @IsNotEmpty()
  @IsString()
  type: string;
}

export class GetOneUploadsDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  folder: string;
}
