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

  @IsNotEmpty()
  @IsString()
  farrowingDate: Date;
}

export class UpdateFarrowingsDto {
  @IsOptional()
  @IsNumber()
  litter: number;

  @IsOptional()
  @IsNumber()
  weight: number;

  @IsOptional()
  @IsString()
  note: string;

  @IsOptional()
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
