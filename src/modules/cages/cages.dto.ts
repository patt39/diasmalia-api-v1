import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateOrUpdateCagesDto {
  @IsOptional()
  @IsString()
  code: string;

  @IsOptional()
  @IsNumber()
  dimension: number;

  @IsOptional()
  @IsNumber()
  number: number;

  @IsNotEmpty()
  @IsNumber()
  numberPerCage: number;
}

export class CagesEggHarvestedDto {
  @IsNotEmpty()
  @IsNumber()
  number: number;

  @IsNotEmpty()
  @IsString()
  size: string;
}

export class DeathDto {
  @IsNotEmpty()
  @IsNumber()
  number: number;

  @IsNotEmpty()
  @IsString()
  size: string;
}

export class GetCagesDto {
  @IsOptional()
  @IsUUID()
  @IsString()
  animalId: string;
}
