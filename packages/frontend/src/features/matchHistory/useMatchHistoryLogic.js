import { useCallback, useEffect, useMemo, useState } from 'react';
import MatchHistoryService from './matchHistoryService.js';

const DEFAULT_LIMIT = 10;

export function useMatchHistoryLogic() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');

  const [filters, setFilters] = useState({
    search: '',
    result: 'ALL',
    dateFrom: '',
    dateTo: '',
    sortOrder: 'desc'
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: DEFAULT_LIMIT,
    totalItems: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setFilters((prev) => ({ ...prev, search: searchInput.trim() }));
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const payload = await MatchHistoryService.getHistory({
        page,
        limit: DEFAULT_LIMIT,
        search: filters.search || undefined,
        result: filters.result,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
        sortOrder: filters.sortOrder
      });

      setRows(payload.items || []);
      setPagination(payload.pagination || {
        page,
        limit: DEFAULT_LIMIT,
        totalItems: payload.items?.length || 0,
        totalPages: payload.items?.length ? 1 : 0,
        hasNextPage: false,
        hasPreviousPage: page > 1
      });
    } catch (fetchError) {
      setError(fetchError?.response?.data?.message || 'Failed to fetch match history.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [filters.dateFrom, filters.dateTo, filters.result, filters.search, filters.sortOrder, page]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const setResultFilter = (value) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, result: value }));
  };

  const setDateFromFilter = (value) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, dateFrom: value }));
  };

  const setDateToFilter = (value) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, dateTo: value }));
  };

  const toggleSortOrder = () => {
    setPage(1);
    setFilters((prev) => ({
      ...prev,
      sortOrder: prev.sortOrder === 'desc' ? 'asc' : 'desc'
    }));
  };

  const resetFilters = () => {
    setSearchInput('');
    setPage(1);
    setFilters({
      search: '',
      result: 'ALL',
      dateFrom: '',
      dateTo: '',
      sortOrder: 'desc'
    });
  };

  const summary = useMemo(() => {
    const totalItems = pagination?.totalItems || 0;
    const limit = pagination?.limit || DEFAULT_LIMIT;
    const currentPage = pagination?.page || page;

    const start = totalItems === 0 ? 0 : (currentPage - 1) * limit + 1;
    const end = totalItems === 0 ? 0 : Math.min(currentPage * limit, totalItems);

    return {
      start,
      end,
      totalItems,
      totalPages: pagination?.totalPages || 0,
      hasPreviousPage: Boolean(pagination?.hasPreviousPage),
      hasNextPage: Boolean(pagination?.hasNextPage),
      limit
    };
  }, [page, pagination]);

  return {
    rows,
    loading,
    error,
    page,
    setPage,
    searchInput,
    setSearchInput,
    filters,
    setResultFilter,
    setDateFromFilter,
    setDateToFilter,
    toggleSortOrder,
    resetFilters,
    refresh: fetchHistory,
    summary
  };
}
