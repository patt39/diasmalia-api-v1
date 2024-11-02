import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class UpdateFeedStocksDto {
  @IsOptional()
  @IsString()
  feedCategory: string;

  @IsOptional()
  @IsNumber()
  number: number;

  @IsOptional()
  composition: any;

  @IsOptional()
  @IsNumber()
  bagWeight: number;

  @IsOptional()
  @IsString()
  @IsUUID()
  animalTypeId: string;
}

export class CreateFeedStocksDto {
  @IsNotEmpty()
  @IsNumber()
  number: number;

  @IsNotEmpty()
  @IsNumber()
  bagWeight: number;

  @IsOptional()
  @IsString()
  feedCategory: string;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  animalTypeId: string;
}

export class GetFeedStockQueryDto {
  @IsOptional()
  @IsString()
  @IsUUID()
  animalTypeId: string;

  @IsOptional()
  @IsString()
  animalTypeName: string;
}
