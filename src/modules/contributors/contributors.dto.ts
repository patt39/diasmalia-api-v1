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

export class GetContributorsByRoleDto {
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
  @IsOptional()
  @IsString()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  companyName: string;

  @IsOptional()
  @IsString()
  occupation: string;

  @IsOptional()
  @IsString()
  description: string;
}
