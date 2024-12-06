import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateOrUpdateFinancesDto {
  @IsOptional()
  @IsString()
  detail: string;

  @IsOptional()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsInt()
  amount: number;

  @IsNotEmpty()
  @IsString()
  type: string;
}

export class GetFinancesByType {
  @IsOptional()
  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  periode: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  animalTypeId: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  animalId: string;
}
