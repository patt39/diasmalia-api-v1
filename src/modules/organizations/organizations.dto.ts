import { IsString, MaxLength, IsOptional } from 'class-validator';

export class CreateOrUpdateOrganizationsDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name: string;
}
