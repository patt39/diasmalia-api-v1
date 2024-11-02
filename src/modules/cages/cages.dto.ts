import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCagesDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsNumber()
  dimension: number;

  @IsNotEmpty()
  @IsNumber()
  animalsPerCage: number;
}

export class UpdateCagesDto {
  @IsNotEmpty()
  @IsNumber()
  dimension: number;
}
