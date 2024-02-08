import { MethodDisposal } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
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
  @MaxLength(100)
  codeAnimal: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @IsEnum(MethodDisposal)
  method: MethodDisposal;
}
