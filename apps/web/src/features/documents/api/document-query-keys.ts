export const documentQueryKeys = {
  all: ['documents'] as const,
  list: (page: number, limit: number) => [...documentQueryKeys.all, 'list', page, limit] as const,
  detail: (id: string) => [...documentQueryKeys.all, 'detail', id] as const,
};
