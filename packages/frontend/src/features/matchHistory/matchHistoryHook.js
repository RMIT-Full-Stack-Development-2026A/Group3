import { useState, useEffect, useCallback, useRef } from 'react';
import matchHistoryService from './matchHistoryService';
import matchHistoryModel from './matchHistoryModel';

const ITEMS_PER_PAGE = 10;

export function useMatchHistory(options = {}) {
  const { autoFetch = true } = options;

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  // Filter state
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [resultFilter, setResultFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('desc');

  // Debounce ref for search
  const searchTimerRef = useRef(null);

  const fetchHistory = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = {
        page: params.page || page,
        limit: ITEMS_PER_PAGE,
        search: params.search !== undefined ? params.search : search,
        result: params.result || resultFilter,
        sortOrder: params.sortOrder || sortOrder,
      };

      const response = await matchHistoryService.getHistory(queryParams);
      const data = response.data || response;

      setHistory(matchHistoryModel.formatHistory(data.items || data));
      setPagination(data.pagination || null);
    } catch (err) {
      setError(err.message || 'Failed to fetch history');
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, resultFilter, sortOrder]);

  // Auto-fetch on mount and when filters change
  useEffect(() => {
    if (autoFetch) {
      fetchHistory();
    }
  }, [page, resultFilter, sortOrder]);

  // Debounced search
  const handleSearch = useCallback((value) => {
    setSearch(value);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setPage(1);
      fetchHistory({ page: 1, search: value });
    }, 400);
  }, [fetchHistory]);

  const handleResultFilter = useCallback((value) => {
    setResultFilter(value);
    setPage(1);
  }, []);

  const handleSortOrder = useCallback((value) => {
    setSortOrder(value);
    setPage(1);
  }, []);

  const goToPage = useCallback((newPage) => {
    if (newPage < 1) return;
    if (pagination && newPage > pagination.totalPages) return;
    setPage(newPage);
  }, [pagination]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, []);

  return {
    history,
    loading,
    error,
    pagination,
    page,
    search,
    resultFilter,
    sortOrder,
    setSearch: handleSearch,
    setResultFilter: handleResultFilter,
    setSortOrder: handleSortOrder,
    goToPage,
    refresh: fetchHistory
  };
}
