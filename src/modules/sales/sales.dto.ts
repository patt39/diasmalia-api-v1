import { sellingDetail, sellingMethod } from '@prisma/client';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateOrUpdateSalesDto {
  @IsOptional()
  @IsString()
  note: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(sellingDetail)
  detail: sellingDetail;

  @IsNotEmpty()
  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  soldTo: string;

  @IsOptional()
  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsOptional()
  @IsNumber()
  number: number;

  @IsOptional()
  @IsNumber()
  male: number;

  @IsOptional()
  @IsNumber()
  female: number;

  @IsOptional()
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  @IsEnum(sellingMethod)
  method: sellingMethod;
}

export class BulkSalesDto {
  @IsNotEmpty()
  @IsString()
  note: string;

  @IsNotEmpty()
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
  @IsNumber()
  price: number;

  @IsOptional()
  @IsInt()
  number: number;

  @IsNotEmpty()
  @IsString()
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
  @IsEnum(sellingDetail)
  detail: sellingDetail;

  @IsOptional()
  @IsString()
  @IsUUID()
  animalTypeId: string;

  @IsOptional()
  @IsString()
  periode: string;
}

export class GetOneUploadsDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  folder: string;
}
