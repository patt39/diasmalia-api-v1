import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Match } from 'src/app/utils/decorators';

export class RegisterUserDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsString()
  organizationName: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;
}

export class CreateLoginUserDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  @IsString()
  password: string;
}

export class ConfirmEmailUserDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  code: string;
}

export class ResetPasswordUserDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @IsEmail()
  email: string;
}

export class UpdateResetPasswordUserDto {
  @IsNotEmpty()
  @MinLength(8)
  @IsString()
  password: string;

  @IsString()
  @MinLength(8)
  @Match('password')
  passwordConfirm: string;

  @IsNotEmpty()
  @MinLength(8)
  @IsString()
  token: string;
}

export class ContributorConfirmDto {
  @IsNotEmpty()
  @MinLength(8)
  @IsString()
  password: string;

  @IsNotEmpty()
  @MinLength(8)
  @IsString()
  @Match('password')
  passwordConfirm: string;
}

export class verifyTokenDto {
  @IsOptional()
  @IsString()
  token: string;
}

export class UpdateUserPasswordDto {
  @IsOptional()
  @MaxLength(100)
  @MinLength(8)
  @IsString()
  password: string;

  @IsString()
  @MaxLength(100)
  @MinLength(8)
  newPassword: string;

  @IsString()
  @MaxLength(100)
  @MinLength(8)
  @Match('newPassword')
  passwordConfirm: string;
}

export class UpdateOneEmailUserDto {
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  @IsString()
  password: string;
}

export class GetUsers {
  @IsOptional()
  @IsString()
  email: string;
}
