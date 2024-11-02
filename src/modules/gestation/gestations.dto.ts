import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateGestationsDto {
  @IsOptional()
  @IsString()
  note: string;

  @IsOptional()
  @IsString()
  method: string;

  @IsOptional()
  @IsString()
  farrowingDate: Date;
}

export class GestationsQueryDto {
  @IsOptional()
  @IsString()
  @IsUUID()
  animalTypeId: string;

  @IsOptional()
  @IsString()
  periode: string;
}
