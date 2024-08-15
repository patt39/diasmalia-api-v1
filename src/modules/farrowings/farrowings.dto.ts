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

  @IsOptional()
  @IsString()
  note: string;

  @IsNotEmpty()
  @IsString()
  codeFemale: string;
}

export class UpdateFarrowingsDto {
  @IsOptional()
  @IsNumber()
  litter: number;
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
