import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateOrUpdateFarrowingsDto {
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

export class FarrowingQueryDto {
  @IsOptional()
  @IsString()
  @IsUUID()
  animalTypeId: string;
}
