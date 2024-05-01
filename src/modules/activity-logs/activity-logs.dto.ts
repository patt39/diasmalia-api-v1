import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateOrUpdateAnimalTypesDto {
  @IsNotEmpty()
  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  ipAddress: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  userId: string;
}
