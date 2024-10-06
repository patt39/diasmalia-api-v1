import { HealthMethod } from '@prisma/client';
import {
  IsArray,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateHealthsDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  animalTypeId: string;

  @IsOptional()
  @IsString()
  @IsEnum(HealthMethod)
  category: HealthMethod;
}

export class SelectMedecinesDto {
  @IsNotEmpty()
  @IsArray()
  medecines: any;
}

export class GetHealthQueryDto {
  @IsOptional()
  @IsString()
  @IsUUID()
  animalTypeId: string;

  @IsOptional()
  @IsString()
  @IsEnum(HealthMethod)
  category: HealthMethod;

  @IsOptional()
  @IsString()
  @IsIn(['true', 'false'])
  status: string;
}
