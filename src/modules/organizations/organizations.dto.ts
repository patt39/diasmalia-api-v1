import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateOrUpdateOrganizationsDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  description: string;

  @IsOptional()
  @IsString()
  logo: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  image: string;
}
