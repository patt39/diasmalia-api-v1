import { Prisma } from '@prisma/client';
import { SortType } from './request-pagination.dto';

export type WithPaginationResponse = {
  pagination?: PaginationType;
  value: any;
  rowCount?: number;
};

export type PaginationType = {
  page: number;
  take: number;
  skip?: number;
  limit?: number;
  offset?: number;
  cursor?: string;
  orderBy?: any;
  sortBy?: string;
  isPaginate?: string;
  sort: SortType;
};

export const addPagination = (options: PaginationType) => {
  const pagination: any = {};
  const { page, take, sort, isPaginate, sortBy } = options;
  const takePage = Number(page);
  const currentTake = Number(take);
  const takeSkip = (Number(page) - 1) * currentTake;
  const pageTakeSkip = {
    page: takePage <= 0 ? 1 : takePage,
    take: currentTake,
    skip: takeSkip < 0 ? takeSkip * -1 : takeSkip,
  };
  if (sortBy) {
    pagination.orderBy = { [sortBy as string]: sort as Prisma.SortOrder };
  }
  pagination.page = pageTakeSkip?.page;
  pagination.limit = pageTakeSkip?.take;
  pagination.offset = takeSkip;
  pagination.take = pageTakeSkip?.take;
  pagination.skip = pageTakeSkip?.skip;
  pagination.sort = sort;
  pagination.isPaginate = isPaginate;

  return pagination;
};

export const withPagination = async (options: WithPaginationResponse) => {
  const { rowCount, value, pagination } = options;

  const n_pages = Math.ceil(Number(rowCount) / Number(pagination?.take));

  const next_page =
    pagination?.page && pagination?.page < n_pages
      ? pagination?.page + 1
      : undefined;

  const prev_page =
    pagination?.page && pagination?.page > 1 ? pagination?.page - 1 : undefined;

  return {
    total: rowCount,
    per_page: pagination?.take ?? 0,
    current_page: pagination?.page,
    next_page: next_page,
    prev_page: prev_page,
    last_page: n_pages ? n_pages : undefined,
    skip: pagination?.skip,
    sort: pagination?.sort ?? 'desc',
    is_paginate: pagination?.isPaginate ?? 'false',
    total_page: n_pages,
    total_value: Array.isArray(value) ? value.length : 0,
    value,
  };
};
