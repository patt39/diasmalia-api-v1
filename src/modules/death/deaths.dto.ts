import { MethodDisposal } from '@prisma/client';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsUUID,
  IsEnum,
} from 'class-validator';

export class CreateOrUpdateDeathsDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  note: string;

  @IsNotEmpty()
  @IsString()
  date: Date;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  cause: string;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  animalId: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @IsEnum(MethodDisposal)
  method: MethodDisposal;
}
