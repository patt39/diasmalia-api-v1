import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateOrUpdateOrganizationsDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name: string;
}
