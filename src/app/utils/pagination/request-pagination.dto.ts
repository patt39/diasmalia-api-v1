import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsInt,
  Min,
  IsString,
  IsPositive,
  IsIn,
  IsOptional,
} from 'class-validator';

export type SortType = 'ASC' | 'DESC';

export type ProductStatus = 'ACTIVE' | 'PENDING';

export class RequestPaginationDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsPositive()
  take: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page: number;

  @IsNotEmpty()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  @Type(() => String)
  sort: SortType;

  @IsOptional()
  @IsString()
  @IsIn(['true', 'false'])
  @Type(() => String)
  isPaginate: string;
}
