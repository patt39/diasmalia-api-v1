import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export class CreateOrUpdateProfilesDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  firstName: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  lastName: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  address: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone: string;

  @IsOptional()
  @IsString()
  url: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  birthday: Date;

  @IsOptional()
  @IsString()
  image: string;
}
