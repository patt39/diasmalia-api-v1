import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateIncubationsDto {
  @IsNotEmpty()
  @IsNumber()
  quantityStart: number;

  @IsOptional()
  @IsString()
  dueDate: Date;

  @IsNotEmpty()
  @IsString()
  code: string;
}

export class UpdateIncubationsDto {
  @IsOptional()
  @IsNumber()
  quantityEnd: number;

  @IsNotEmpty()
  @IsNumber()
  quantityStart: number;

  @IsNotEmpty()
  @IsString()
  dueDate: Date;

  @IsNotEmpty()
  @IsString()
  code: string;
}

export class IncubationQueryDto {
  @IsOptional()
  @IsString()
  @IsUUID()
  animalTypeId: string;

  @IsOptional()
  @IsString()
  periode: string;
}
