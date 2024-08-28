import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateOrUpdateMilkingsDto {
  @IsOptional()
  @IsString()
  note: string;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsNotEmpty()
  @IsString()
  femaleCode: string;
}

export class BulkMilkingsDto {
  @IsOptional()
  @IsString()
  note: string;

  @IsNotEmpty()
  @IsArray()
  animals: any;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;
}

export class GetMilkingsQueryDto {
  @IsOptional()
  @IsString()
  @IsUUID()
  animalTypeId: string;
}
