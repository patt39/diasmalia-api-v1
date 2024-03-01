import { IsNotEmpty, IsString } from 'class-validator';

export class CreateOrUpdateIsolationsDto {
  @IsNotEmpty()
  @IsString()
  date: Date;

  @IsNotEmpty()
  @IsString()
  note: string;

  @IsNotEmpty()
  @IsString()
  code: string;
}
