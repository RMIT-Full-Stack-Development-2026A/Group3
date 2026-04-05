import { useEffect, useMemo, useState } from 'react';

import {
	DEFAULT_MATCH_HISTORY_QUERY,
	DEFAULT_PROFILE,
} from './profile.model';
import { getMatchHistory } from './profile.service';

const SEARCH_DEBOUNCE_MS = 350;

export const useProfileLogic = () => {
	const [profile] = useState(DEFAULT_PROFILE);

	const [matchItems, setMatchItems] = useState([]);
	const [pagination, setPagination] = useState({
		page: 1,
		limit: DEFAULT_MATCH_HISTORY_QUERY.limit,
		totalItems: 0,
		totalPages: 0,
		hasNextPage: false,
		hasPreviousPage: false,
	});

	const [stats] = useState(profile.stats);
	const [query, setQuery] = useState(DEFAULT_MATCH_HISTORY_QUERY);
	const [debouncedSearch, setDebouncedSearch] = useState(DEFAULT_MATCH_HISTORY_QUERY.search);

	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(query.search);
		}, SEARCH_DEBOUNCE_MS);

		return () => clearTimeout(timer);
	}, [query.search]);

	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true);
			setErrorMessage('');

			try {
				const response = await getMatchHistory({
					page: query.page,
					limit: query.limit,
					search: debouncedSearch,
					result: query.result,
					date: query.date,
					sortOrder: query.sortOrder,
				});

				setMatchItems(response.items);
				setPagination(response.pagination);
			} catch (error) {
				const fallbackMessage = 'Could not load match history. Please check your API server.';
				const apiMessage = error?.response?.data?.error?.message;
				setErrorMessage(apiMessage || fallbackMessage);
				setMatchItems([]);
				setPagination((previous) => ({
					...previous,
					totalItems: 0,
					totalPages: 0,
					hasNextPage: false,
					hasPreviousPage: false
				}));
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, [query.page, query.limit, query.result, query.date, query.sortOrder, debouncedSearch, profile.stats]);

	const summary = useMemo(() => {
		return {
			start: pagination.totalItems === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1,
			end: Math.min(pagination.page * pagination.limit, pagination.totalItems),
			total: pagination.totalItems,
		};
	}, [pagination]);

	const updateSearch = (value) => {
		setQuery((previous) => ({
			...previous,
			page: 1,
			search: value,
		}));
	};

	const updateResultFilter = (value) => {
		setQuery((previous) => ({
			...previous,
			page: 1,
			result: value,
		}));
	};

	const updateDateFilter = (value) => {
		setQuery((previous) => ({
			...previous,
			page: 1,
			date: value,
		}));
	};

	const updateSortOrder = (value) => {
		setQuery((previous) => ({
			...previous,
			page: 1,
			sortOrder: value,
		}));
	};

	const goToNextPage = () => {
		if (!pagination.hasNextPage) {
			return;
		}

		setQuery((previous) => ({
			...previous,
			page: previous.page + 1,
		}));
	};

	const goToPreviousPage = () => {
		if (!pagination.hasPreviousPage) {
			return;
		}

		setQuery((previous) => ({
			...previous,
			page: previous.page - 1,
		}));
	};

	const clearFilters = () => {
		setQuery((previous) => ({
			...previous,
			page: 1,
			search: '',
			result: 'ALL',
			date: '',
			sortOrder: 'desc',
		}));
	};

	return {
		profile,
		matchItems,
		pagination,
		summary,
		stats,
		query,
		isLoading,
		errorMessage,
		updateSearch,
		updateResultFilter,
		updateDateFilter,
		updateSortOrder,
		goToNextPage,
		goToPreviousPage,
		clearFilters,
	};
};

