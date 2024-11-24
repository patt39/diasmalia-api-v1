import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateOrUpdateContactsDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  subject: string;

  @IsOptional()
  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  fullName: string;

  @IsNotEmpty()
  @IsString()
  description: string;
}
