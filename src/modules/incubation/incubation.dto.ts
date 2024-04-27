import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateOrUpdateEggHavestingsDto {
  @IsNotEmpty()
  @IsNumber()
  quantityEnd: number;

  @IsNotEmpty()
  @IsNumber()
  quantityStart: number;

  @IsOptional()
  @IsString()
  note: string;

  @IsNotEmpty()
  @IsString()
  date: Date;

  @IsNotEmpty()
  @IsString()
  dueDate: Date;

  @IsOptional()
  @IsString()
  @IsUUID()
  eggHavestingId: string;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  animalTypeId: string;
}

export class IncubationQueryDto {
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  animalTypeId: string;
}
