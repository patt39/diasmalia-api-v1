import { RoleContributorRole } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateOrUpdateContributorDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @IsEnum(RoleContributorRole)
  role: RoleContributorRole;
}

export class GetContributorsDto {
  @IsOptional()
  @IsString()
  @IsEnum(RoleContributorRole)
  role: RoleContributorRole;

  @IsOptional()
  @IsString()
  @IsUUID()
  organizationId: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  userId: string;
}
export class AddContributorUserDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
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
  city: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  testimonial: string;

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
  occupation: string;

  @IsOptional()
  @IsString()
  photo: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  currencyId: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  countryId: string;

  @IsOptional()
  @IsString()
  @IsEnum(RoleContributorRole)
  role: RoleContributorRole;
}

export class InvitationConfirmationDto {
  @IsOptional()
  @IsString()
  confirmation: string;

  @IsNotEmpty()
  @IsString()
  token: string;
}
