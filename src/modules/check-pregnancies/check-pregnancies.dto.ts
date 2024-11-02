import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateOrUpdateCheckPregnanciesDto {
  @IsOptional()
  @IsString()
  farrowingDate: Date;

  @IsNotEmpty()
  @IsString()
  method: string;

  @IsOptional()
  @IsString()
  locationCode: string;

  @IsNotEmpty()
  @IsString()
  result: string;
}

export class checkPregancyQueryDto {
  @IsOptional()
  @IsString()
  @IsUUID()
  animalTypeId: string;
}
