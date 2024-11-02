import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateOrUpdateFaqsDto {
  @IsOptional()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;
}
