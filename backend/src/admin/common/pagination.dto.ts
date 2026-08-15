import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
}

export interface PaginatedDto<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export function paginationParams(dto: PaginationQueryDto): {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
} {
  const page = dto.page ?? 1;
  const pageSize = dto.pageSize ?? 20;
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
}
