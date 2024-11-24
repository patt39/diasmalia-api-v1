import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateOrUpdateBuildingsDto {
  @IsOptional()
  @IsNumber()
  squareMeter: number;

  @IsOptional()
  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  productionPhase: string;
}

export class GetBuildingsQueryDto {
  @IsOptional()
  @IsString()
  productionPhase: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  animalTypeId: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  organizationId: string;
}
