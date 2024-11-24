import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateSalesDto {
  @IsOptional()
  @IsString()
  note: string;

  @IsOptional()
  @IsString()
  detail: string;

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
  method: string;
}

export class UpdateSalesDto {
  @IsOptional()
  @IsString()
  note: string;

  @IsOptional()
  @IsString()
  detail: string;

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
  method: string;
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
  method: string;

  @IsNotEmpty()
  @IsArray()
  animals: any;
}
export class SalesDto {
  @IsOptional()
  @IsString()
  method: string;

  @IsOptional()
  @IsString()
  detail: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  animalTypeId: string;

  @IsOptional()
  @IsString()
  periode: string;
}
