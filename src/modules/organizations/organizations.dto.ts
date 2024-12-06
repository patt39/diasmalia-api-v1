import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateOrganizationsDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;
}

export class GetOneUploadsDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  folder: string;
}

export class GetOrganizationQueryDto {
  @IsOptional()
  @IsString()
  userId: string;
}

export class GetImagesQueryDto {
  @IsOptional()
  @IsString()
  @IsUUID()
  userCreatedId: string;
}
