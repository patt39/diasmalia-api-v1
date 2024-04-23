import { AnimalStatus, sellingMethod } from '@prisma/client';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
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

  @IsNotEmpty()
  @IsString()
  date: Date;

  @IsOptional()
  @IsString()
  @IsEnum(sellingMethod)
  method: sellingMethod;

  @IsOptional()
  @IsString()
  @IsEnum(AnimalStatus)
  status: AnimalStatus;

  @IsOptional()
  @IsString()
  @IsUUID()
  animalTypeId: string;
}

export class BulkSalesDto {
  @IsOptional()
  @IsString()
  note: string;

  @IsNotEmpty()
  @IsString()
  date: Date;

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

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  animalTypeId: string;
}
export class SalesDto {
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
