import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateFarrowingsDto {
  @IsNotEmpty()
  @IsNumber()
  litter: number;

  @IsNotEmpty()
  @IsNumber()
  dead: number;

  @IsNotEmpty()
  @IsString()
  note: string;

  @IsNotEmpty()
  @IsNumber()
  weight: number;

  @IsOptional()
  @IsString()
  codeFemale: string;
}

export class UpdateFarrowingsDto {
  @IsOptional()
  @IsNumber()
  litter: number;

  @IsNotEmpty()
  @IsNumber()
  weight: number;

  @IsNotEmpty()
  @IsString()
  note: string;

  @IsNotEmpty()
  @IsNumber()
  dead: number;
}

export class FarrowingQueryDto {
  @IsOptional()
  @IsString()
  @IsUUID()
  animalTypeId: string;

  @IsOptional()
  @IsString()
  periode: string;
}
