import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateEggHavestingsDto {
  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsNotEmpty()
  @IsString()
  size: string;

  @IsNotEmpty()
  @IsString()
  code: string;
}

export class UpdateEggHavestingsDto {
  @IsOptional()
  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsString()
  size: string;

  @IsOptional()
  @IsString()
  code: string;
}

export class EggHavestingQueryDto {
  @IsOptional()
  @IsString()
  periode: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  animalTypeId: string;
}
