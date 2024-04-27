import { CastrationMethod } from '@prisma/client';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
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

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  animalTypeId: string;
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

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  animalTypeId: string;
}

export class GetCastrationsQueryDto {
  @IsOptional()
  @IsString()
  @IsEnum(CastrationMethod)
  method: CastrationMethod;

  @IsOptional()
  @IsString()
  @IsUUID()
  animalTypeId: string;
}
