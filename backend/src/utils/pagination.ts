export interface PaginationParams {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
}

export const parsePagination = (query: Record<string, unknown>): PaginationParams => {
  const page = Math.max(1, parseInt(String(query.page || '1'), 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(String(query.pageSize || '20'), 10)));
  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
};

export const paginatedResponse = <T>(
  data: T[],
  total: number,
  params: PaginationParams
) => ({
  data,
  pagination: {
    page: params.page,
    pageSize: params.pageSize,
    total,
    totalPages: Math.ceil(total / params.pageSize),
  },
});
