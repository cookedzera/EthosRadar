import { useState, useEffect, useMemo } from 'react';
import { debounce } from '@/utils/performance';

export function useDebouncedSearch(query: string, delay: number = 300) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  const debouncedSetQuery = useMemo(
    () => debounce((newQuery: string) => {
      setDebouncedQuery(newQuery);
    }, delay),
    [delay]
  );

  useEffect(() => {
    debouncedSetQuery(query);
  }, [query, debouncedSetQuery]);

  return debouncedQuery;
}