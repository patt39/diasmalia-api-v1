import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class UpdateIsolationsDto {
  @IsNotEmpty()
  @IsString()
  note: string;

  @IsOptional()
  @IsNumber()
  number: number;

  @IsOptional()
  @IsString()
  code: string;
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
