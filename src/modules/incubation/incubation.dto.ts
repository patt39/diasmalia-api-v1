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
  dueDate: Date;

  @IsOptional()
  @IsString()
  @IsUUID()
  eggHavestingId: string;
}

export class IncubationQueryDto {
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  animalTypeId: string;
}
