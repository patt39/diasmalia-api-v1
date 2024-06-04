import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateOrUpdateFatteningsDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsNumber()
  actualWeight: number;

  @IsNotEmpty()
  @IsNumber()
  initialWeight: number;
}

export class BulkFatteningsDto {
  @IsNotEmpty()
  @IsArray()
  animals: any;
}

export class GetCastrationsQueryDto {
  @IsOptional()
  @IsString()
  @IsUUID()
  animalTypeId: string;
}
