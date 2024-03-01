import { CastrationMethod } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateOrUpdateCastrationsDto {
  @IsNotEmpty()
  @IsString()
  date: Date;

  @IsNotEmpty()
  @IsString()
  note: string;

  @IsNotEmpty()
  @IsString()
  maleCode: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(CastrationMethod)
  method: CastrationMethod;
}
