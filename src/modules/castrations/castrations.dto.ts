import { CastrationMethod } from '@prisma/client';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateOrUpdateCastrationsDto {
  @IsNotEmpty()
  @IsString()
  date: Date;

  @IsNotEmpty()
  @IsString()
  note: string;

  @IsNotEmpty()
  @IsString()
  maleCode: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(CastrationMethod)
  method: CastrationMethod;
}

export class BulkCastrationsDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  note: string;

  @IsNotEmpty()
  @IsString()
  date: Date;

  @IsNotEmpty()
  @IsArray()
  animals: any;

  @IsNotEmpty()
  @IsString()
  @IsEnum(CastrationMethod)
  method: CastrationMethod;
}

export class GetCastrationsByMethodDto {
  @IsNotEmpty()
  @IsString()
  @IsEnum(CastrationMethod)
  method: CastrationMethod;
}
