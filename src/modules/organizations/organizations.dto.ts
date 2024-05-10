import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateOrUpdateOrganizationsDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  logo: string;

  @IsOptional()
  @IsString()
  image: string;
}

export class GetOneUploadsDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  folder: string;
}
