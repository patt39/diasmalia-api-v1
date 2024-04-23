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
  quantity: number;

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
  animalId: string;
}

export class IncubationQueryDto {
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  animalTypeId: string;
}
