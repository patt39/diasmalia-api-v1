import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class UpdateIsolationsDto {
  @IsOptional()
  @IsNumber()
  number: number;

  @IsOptional()
  @IsNumber()
  female: number;

  @IsOptional()
  @IsNumber()
  male: number;

  @IsOptional()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  note: string;
}

export class CreateIsolationsDto extends UpdateIsolationsDto {
  @IsNotEmpty()
  @IsString()
  code: string;
}

export class BulkIsolationsDto {
  @IsNotEmpty()
  @IsString()
  note: string;

  @IsNotEmpty()
  @IsArray()
  animals: any;
}

export class IsolationsQueryDto {
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  animalTypeId: string;

  @IsOptional()
  @IsString()
  periode: string;
}
