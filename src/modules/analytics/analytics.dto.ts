import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class GetAnalyticsQuery {
  @IsOptional()
  @IsString()
  days: string;

  @IsOptional()
  @IsString()
  months: string;

  @IsOptional()
  @IsString()
  year: string;

  @IsOptional()
  @IsString()
  periode: string;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  animalTypeId: string;
}
