import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateOrUpdateWeaningsDto {
  @IsNotEmpty()
  @IsNumber()
  litter: number;

  @IsOptional()
  @IsString()
  note: string;

  @IsNotEmpty()
  @IsString()
  date: Date;

  @IsNotEmpty()
  @IsString()
  codeFemale: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  farrowingId: string;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  animalTypeId: string;
}

export class WeaningDto {
  @IsOptional()
  @IsString()
  @IsUUID()
  animalTypeId: string;
}
