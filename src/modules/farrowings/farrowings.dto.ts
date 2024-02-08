import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateOrUpdateFarrowingsDto {
  @IsNotEmpty()
  @IsNumber()
  litter: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  note: string;

  @IsNotEmpty()
  @IsString()
  date: Date;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  codeFemale: string;
}
