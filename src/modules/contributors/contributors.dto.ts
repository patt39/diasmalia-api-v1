import { RoleContributorRole } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateOrUpdateContributorDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @IsEnum(RoleContributorRole)
  role: RoleContributorRole;
}
export class AddContributorUserDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @MaxLength(50)
  email: string;
}
export class CreateOneContributorUserDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @MaxLength(50)
  email: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  lastName: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  phone: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  address: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  companyName: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  occupation: string;
}
