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
  note: string;

  @IsOptional()
  @IsString()
  animalCode: string;

  @IsOptional()
  @IsString()
  soldTo: string;

  @IsOptional()
  @IsString()
  phone: string;

  @IsOptional()
  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  @IsEnum(sellingMethod)
  method: sellingMethod;

  @IsOptional()
  @IsString()
  @IsEnum(AnimalStatus)
  status: AnimalStatus;

  @IsNotEmpty()
  @IsArray()
  animalsQty: any;
}

export class BulkSalesDto {
  @IsOptional()
  @IsString()
  note: string;

  @IsOptional()
  @IsString()
  soldTo: string;

  @IsOptional()
  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
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
export class SalesDto {
  @IsOptional()
  @IsString()
  @IsEnum(sellingMethod)
  method: sellingMethod;

  @IsOptional()
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
