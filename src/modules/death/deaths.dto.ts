import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class UpdateDeathsDto {
  @IsNotEmpty()
  @IsString()
  note: string;

  @IsOptional()
  @IsNumber()
  number: number;

  @IsOptional()
  @IsNumber()
  female: number;

  @IsOptional()
  @IsNumber()
  male: number;
}

export class CreateDeathsDto extends UpdateDeathsDto {
  @IsNotEmpty()
  @IsString()
  code: string;
}

export class BulkDeathsDto {
  @IsNotEmpty()
  @IsString()
  note: string;

  @IsNotEmpty()
  @IsArray()
  animals: any;
}

export class DeathQueryDto {
  @IsOptional()
  @IsString()
  @IsUUID()
  animalTypeId: string;

  @IsOptional()
  @IsString()
  periode: string;
}
