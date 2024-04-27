import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateOrUpdateIsolationsDto {
  @IsNotEmpty()
  @IsString()
  date: Date;

  @IsNotEmpty()
  @IsString()
  note: string;

  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  animalTypeId: string;
}

export class BulkIsolationsDto {
  @IsOptional()
  @IsString()
  note: string;

  @IsNotEmpty()
  @IsString()
  date: Date;

  @IsNotEmpty()
  @IsArray()
  animals: any;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  animalTypeId: string;
}

export class IsolationsQueryDto {
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  animalTypeId: string;
}
