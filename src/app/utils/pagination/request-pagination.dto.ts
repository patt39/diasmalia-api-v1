import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export type SortType = 'asc' | 'desc';

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
  @IsIn(['asc', 'desc'])
  @Type(() => String)
  sort: SortType;

  @IsNotEmpty()
  @IsString()
  sortBy: string;

  @IsOptional()
  @IsString()
  @IsIn(['true', 'false'])
  @Type(() => String)
  isPaginate: string;
}
