import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class UpdateFeedingsDto {
  @IsOptional()
  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  feedStockId: string;
}

export class CreateFeedingsDto {
  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsNotEmpty()
  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  feedStockId: string;
}

export class BulkFeedingsDto {
  @IsNotEmpty()
  @IsArray()
  animals: any;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsString()
  @IsUUID()
  feedStockId: string;
}

export class GetFeedQueryDto {
  @IsOptional()
  @IsString()
  @IsUUID()
  animalTypeId: string;

  @IsOptional()
  @IsString()
  periode: string;

  @IsOptional()
  @IsString()
  feedingsCount: string;
}
