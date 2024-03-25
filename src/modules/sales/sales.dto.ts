import { sellingMethod } from '@prisma/client';
import {
  IsEnum,
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
  @MaxLength(100)
  note: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  code: string;

  @IsOptional()
  @IsString()
  soldTo: string;

  @IsOptional()
  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  batchId: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsNotEmpty()
  @IsString()
  date: Date;

  @IsOptional()
  @IsString()
  @IsEnum(sellingMethod)
  method: sellingMethod;
}

export class SaleMethodDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @IsEnum(sellingMethod)
  method: sellingMethod;
}

export class GetOneUploadsDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  folder: string;
}
