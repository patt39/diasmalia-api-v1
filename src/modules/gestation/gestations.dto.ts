import { MethodCheckPregnancy } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateGestationsDto {
  @IsOptional()
  @IsString()
  note: string;

  @IsOptional()
  @IsString()
  @IsEnum(MethodCheckPregnancy)
  method: MethodCheckPregnancy;

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
