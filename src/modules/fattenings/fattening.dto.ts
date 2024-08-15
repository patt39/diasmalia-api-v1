import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class UpdateFatteningsDto {
  @IsOptional()
  @IsNumber()
  actualWeight: number;
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

  @IsOptional()
  @IsString()
  periode: string;
}
